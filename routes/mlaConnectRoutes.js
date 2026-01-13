const express = require('express');
const router = express.Router();
const {
  getMlaConnectQueries,
  getMlaConnectQuery,
  createMlaConnectQuery,
  updateMlaConnectQuery,
  deleteMlaConnectQuery
} = require('../controllers/mlaConnectController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getMlaConnectQueries);
router.get('/:id', getMlaConnectQuery);
router.post('/', createMlaConnectQuery);
router.put('/:id', updateMlaConnectQuery);
router.delete('/:id', authorize('admin'), deleteMlaConnectQuery);

module.exports = router;
