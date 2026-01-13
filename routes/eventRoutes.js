const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validator');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', validateEvent, createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', authorize('admin'), deleteEvent);

module.exports = router;
