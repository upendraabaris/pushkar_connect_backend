const express = require('express');
const router = express.Router();
const {
  getMedia,
  getMediaItem,
  createMedia,
  updateMedia,
  deleteMedia
} = require('../controllers/mediaController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getMedia);
router.get('/:id', getMediaItem);
router.post('/', createMedia);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);

module.exports = router;
