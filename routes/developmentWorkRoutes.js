const express = require('express');
const router = express.Router();
const {
  getDevelopmentWorks,
  getDevelopmentWork,
  createDevelopmentWork,
  updateDevelopmentWork,
  deleteDevelopmentWork
} = require('../controllers/developmentWorkController');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { validateDevelopmentWork } = require('../middleware/validator');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getDevelopmentWorks);
router.get('/:id', getDevelopmentWork);
router.post('/', validateDevelopmentWork, createDevelopmentWork);
router.put('/:id', updateDevelopmentWork);
router.delete('/:id', authorize('admin'), deleteDevelopmentWork);

module.exports = router;
