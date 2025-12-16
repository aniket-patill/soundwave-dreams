import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs
} from '../controllers/playlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadImage } from '../middleware/upload.middleware.js';

const router = Router();

// Public routes
// All other routes require authentication
router.use(protect);

// Routes
router.get('/', getPlaylists);
router.get('/:id', getPlaylist);

// Validation
const createValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Playlist name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

// Playlist CRUD
router.post('/', uploadImage.single('cover'), createValidation, createPlaylist);
router.put('/:id', uploadImage.single('cover'), updateValidation, updatePlaylist);
router.delete('/:id', deletePlaylist);

// Song management
router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);
router.put('/:id/reorder', reorderPlaylistSongs);

export default router;
