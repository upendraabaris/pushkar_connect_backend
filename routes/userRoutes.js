const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
