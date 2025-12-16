import { validationResult } from 'express-validator';
import Song from '../models/Song.js';
import LikedSong from '../models/LikedSong.js';
import ListeningHistory from '../models/ListeningHistory.js';
import cloudinary from '../config/cloudinary.js';
import { getIO } from '../socket.js';

// Helper to upload buffer to cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    uploadStream.end(buffer);
  });
};

// Upload song
export const uploadSong = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, artist, album, duration } = req.body;
    const audioFile = req.files?.audio?.[0];
    const coverFile = req.files?.cover?.[0];

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // Upload audio to Cloudinary
    const audioResult = await uploadToCloudinary(audioFile.buffer, {
      folder: 'cloudly/audio',
      resource_type: 'video',
      format: 'mp3'
    });

    // Upload cover if provided
    let coverResult = null;
    if (coverFile) {
      coverResult = await uploadToCloudinary(coverFile.buffer, {
        folder: 'cloudly/covers',
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      });
    }

    // Create song
    const song = await Song.create({
      title,
      artist,
      album: album || 'Unknown Album',
      audioUrl: audioResult.secure_url,
      audioPublicId: audioResult.public_id,
      coverUrl: coverResult?.secure_url || null,
      coverPublicId: coverResult?.public_id || null,
      duration: duration ? parseInt(duration) : Math.round(audioResult.duration || 0),
      uploadedBy: req.user._id
    });

    // Emit real-time update
    try {
      const io = getIO();
      // Populate uploader info before emitting
      await song.populate('uploadedBy', 'name avatarUrl');
      io.emit('song:uploaded', song);
    } catch (socketError) {
      console.error('Socket emit error:', socketError);
      // Don't fail the request if socket fails
    }

    res.status(201).json({ song });
  } catch (error) {
    console.error('Upload song error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload song' });
  }
};

// Get all songs (with optional filters)
export const getSongs = async (req, res) => {
  try {
    const { search, uploadedBy, limit = 50, page = 1 } = req.query;
    const query = {};

    // Enforce privacy: only show user's own songs
    query.uploadedBy = req.user._id;

    if (search) {
      query.$text = { $search: search };
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get liked status for current user
    const likedSongs = await LikedSong.find({
      user: req.user._id,
      song: { $in: songs.map(s => s._id) }
    });
    const likedSet = new Set(likedSongs.map(l => l.song.toString()));

    const songsWithLiked = songs.map(song => ({
      ...song.toObject(),
      liked: likedSet.has(song._id.toString())
    }));

    const total = await Song.countDocuments(query);

    res.json({
      songs: songsWithLiked,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Failed to get songs' });
  }
};

// Get single song
export const getSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'name avatarUrl');

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if liked
    const liked = await LikedSong.exists({
      user: req.user._id,
      song: song._id
    });

    res.json({
      song: {
        ...song.toObject(),
        liked: !!liked
      }
    });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Failed to get song' });
  }
};

// Delete song
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check ownership
    if (song.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this song' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(song.audioPublicId, { resource_type: 'video' });
    if (song.coverPublicId) {
      await cloudinary.uploader.destroy(song.coverPublicId);
    }

    // Delete related data
    await LikedSong.deleteMany({ song: song._id });
    await ListeningHistory.deleteMany({ song: song._id });

    // Delete song
    await song.deleteOne();

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
};

// Like song
export const likeSong = async (req, res) => {
  try {
    const songId = req.params.id;
    console.log(`[DEBUG] Like request for song: ${songId} by user: ${req.user._id}`);

    const song = await Song.findById(songId);
    if (!song) {
      console.log('[DEBUG] Song not found');
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if already liked
    const existing = await LikedSong.findOne({
      user: req.user._id,
      song: songId
    });

    if (existing) {
      console.log('[DEBUG] Song already liked');
      return res.status(400).json({ error: 'Song already liked' });
    }

    await LikedSong.create({
      user: req.user._id,
      song: songId
    });

    console.log('[DEBUG] Song liked successfully');
    res.json({ message: 'Song liked', liked: true });
  } catch (error) {
    console.error('Like song error:', error);
    res.status(500).json({ error: 'Failed to like song' });
  }
};

// Unlike song
export const unlikeSong = async (req, res) => {
  try {
    console.log(`[DEBUG] Unlike request for song: ${req.params.id} by user: ${req.user._id}`);
    const result = await LikedSong.findOneAndDelete({
      user: req.user._id,
      song: req.params.id
    });

    if (!result) {
      console.log('[DEBUG] Like not found to delete');
      return res.status(404).json({ error: 'Like not found' });
    }

    console.log('[DEBUG] Song unliked successfully');
    res.json({ message: 'Song unliked', liked: false });
  } catch (error) {
    console.error('Unlike song error:', error);
    res.status(500).json({ error: 'Failed to unlike song' });
  }
};

// Get liked songs
export const getLikedSongs = async (req, res) => {
  try {
    console.log(`[DEBUG] Fetching liked songs for user: ${req.user._id}`);
    const { limit = 50, page = 1 } = req.query;

    const likedSongs = await LikedSong.find({ user: req.user._id })
      .populate({
        path: 'song',
        populate: { path: 'uploadedBy', select: 'name avatarUrl' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`[DEBUG] Found ${likedSongs.length} raw liked songs entries`);

    const songs = likedSongs
      .filter(l => l.song) // Filter out deleted songs
      .map(l => ({
        ...l.song.toObject(),
        liked: true,
        likedAt: l.createdAt
      }));

    console.log(`[DEBUG] Returning ${songs.length} valid songs`);

    const total = await LikedSong.countDocuments({ user: req.user._id });

    res.json({
      songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get liked songs error:', error);
    res.status(500).json({ error: 'Failed to get liked songs' });
  }
};

// Record play (listening history)
export const recordPlay = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    // Add to listening history
    await ListeningHistory.create({
      user: req.user._id,
      song: song._id
    });

    res.json({ message: 'Play recorded' });
  } catch (error) {
    console.error('Record play error:', error);
    res.status(500).json({ error: 'Failed to record play' });
  }
};

// Get recently played
export const getRecentlyPlayed = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get unique recent plays
    const history = await ListeningHistory.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { playedAt: -1 } },
      { $group: { _id: '$song', lastPlayed: { $first: '$playedAt' } } },
      { $sort: { lastPlayed: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate song data
    const songIds = history.map(h => h._id);
    const songs = await Song.find({ _id: { $in: songIds } })
      .populate('uploadedBy', 'name avatarUrl');

    // Get liked status
    const likedSongs = await LikedSong.find({
      user: req.user._id,
      song: { $in: songIds }
    });
    const likedSet = new Set(likedSongs.map(l => l.song.toString()));

    // Maintain order and add metadata
    const orderedSongs = history.map(h => {
      const song = songs.find(s => s._id.toString() === h._id.toString());
      if (!song) return null;
      return {
        ...song.toObject(),
        liked: likedSet.has(song._id.toString()),
        lastPlayed: h.lastPlayed
      };
    }).filter(Boolean);

    res.json({ songs: orderedSongs });
  } catch (error) {
    console.error('Get recently played error:', error);
    res.status(500).json({ error: 'Failed to get recently played' });
  }
};
