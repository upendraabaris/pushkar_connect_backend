const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { validateComplaint } = require('../middleware/validator');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getComplaints);
router.get('/:id', getComplaint);
router.post('/', validateComplaint, createComplaint);
router.put('/:id', updateComplaint);
router.delete('/:id', authorize('admin'), deleteComplaint);

module.exports = router;
