const express = require('express');
const router = express.Router();
const {
  getSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme
} = require('../controllers/schemeController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getSchemes);
router.get('/:id', getScheme);
router.post('/', createScheme);
router.put('/:id', updateScheme);
router.delete('/:id', authorize('admin'), deleteScheme);

module.exports = router;
