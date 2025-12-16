import { validationResult } from 'express-validator';
import Playlist from '../models/Playlist.js';
import Song from '../models/Song.js';
import cloudinary from '../config/cloudinary.js';

// Create playlist
export const createPlaylist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPublic } = req.body;
    let coverUrl = null;
    let coverPublicId = null;

    if (req.file) {
      coverUrl = req.file.path;
      coverPublicId = req.file.filename;
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      isPublic: isPublic === 'true' || isPublic === true || false, // Handle FormData string boolean
      coverUrl,
      coverPublicId,
      createdBy: req.user._id,
      songs: []
    });

    res.status(201).json({ playlist });
  } catch (error) {
    // If Db fails but image uploaded, clean up
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
};

// Get user's playlists
export const getPlaylists = async (req, res) => {
  try {
    // Enforce privacy: only show user's own playlists
    // Note: If you want to allow searching public playlists later, you can modify this.
    // Modified to support public playlists for Discover page

    // Enforce privacy: only show user's own playlists
    // Note: If you want to allow searching public playlists later, you can modify this.
    // Modified to support public playlists for Discover page

    let query = {};

    // If querying for public playlists (Discover page)
    if (req.query.public === 'true') {
      query = { isPublic: true };
    } else if (req.user) {
      // If not looking for public, allow users to see their own
      query = { createdBy: req.user._id };
    } else {
      // If not public request and not logged in, return empty or unauthorized
      return res.status(401).json({ error: 'Authentication required' });
    }

    const playlists = await Playlist.find(query)
      .populate('createdBy', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ playlists });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
};

// Get single playlist
export const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('createdBy', 'name avatarUrl')
      .populate({
        path: 'songs.song',
        populate: { path: 'uploadedBy', select: 'name avatarUrl' }
      });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check access
    if (!playlist.isPublic && playlist.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Calculate total duration
    const totalDuration = playlist.songs.reduce((acc, s) => {
      return acc + (s.song?.duration || 0);
    }, 0);

    res.json({
      playlist: {
        ...playlist.toObject(),
        totalDuration
      }
    });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
};

// Update playlist
export const updatePlaylist = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, description, isPublic } = req.body;

    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic === 'true' || isPublic === true;

    // Handle new cover
    if (req.file) {
      // Delete old cover if exists
      if (playlist.coverPublicId) {
        await cloudinary.uploader.destroy(playlist.coverPublicId);
      }
      playlist.coverUrl = req.file.path;
      playlist.coverPublicId = req.file.filename;
    }

    await playlist.save();

    res.json({ playlist });
  } catch (error) {
    if (req.file) await cloudinary.uploader.destroy(req.file.filename);
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
};

// Delete playlist
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete cover from Cloudinary if exists
    if (playlist.coverPublicId) {
      await cloudinary.uploader.destroy(playlist.coverPublicId);
    }

    await playlist.deleteOne();

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
};

// Add song to playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if song already in playlist
    const alreadyAdded = playlist.songs.some(s => s.song.toString() === songId);
    if (alreadyAdded) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    // Add song at the end
    const position = playlist.songs.length;
    playlist.songs.push({ song: songId, position });

    await playlist.save();

    res.json({ message: 'Song added to playlist', playlist });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ error: 'Failed to add song' });
  }
};

// Remove song from playlist
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { songId } = req.params;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Find and remove song
    const songIndex = playlist.songs.findIndex(s => s.song.toString() === songId);
    if (songIndex === -1) {
      return res.status(404).json({ error: 'Song not found in playlist' });
    }

    playlist.songs.splice(songIndex, 1);

    // Reorder remaining songs
    playlist.songs.forEach((s, idx) => {
      s.position = idx;
    });

    await playlist.save();

    res.json({ message: 'Song removed from playlist', playlist });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove song' });
  }
};

// Reorder songs in playlist
export const reorderPlaylistSongs = async (req, res) => {
  try {
    const { songIds } = req.body; // Array of song IDs in new order
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Validate all songs exist in playlist
    const currentSongIds = playlist.songs.map(s => s.song.toString());
    const valid = songIds.every(id => currentSongIds.includes(id)) &&
      songIds.length === currentSongIds.length;

    if (!valid) {
      return res.status(400).json({ error: 'Invalid song order' });
    }

    // Create new order
    const newSongs = songIds.map((songId, idx) => {
      const existing = playlist.songs.find(s => s.song.toString() === songId);
      return {
        song: existing.song,
        position: idx,
        addedAt: existing.addedAt
      };
    });

    playlist.songs = newSongs;
    await playlist.save();

    res.json({ message: 'Playlist reordered', playlist });
  } catch (error) {
    console.error('Reorder playlist error:', error);
    res.status(500).json({ error: 'Failed to reorder playlist' });
  }
};
