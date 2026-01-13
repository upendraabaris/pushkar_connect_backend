const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, is_read } = req.query;
    
    let queryText = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;
    const params = [req.user.id];
    let paramCount = 2;

    if (is_read !== undefined) {
      queryText += ` AND is_read = $${paramCount++}`;
      params.push(is_read === 'true');
    }

    queryText += ` ORDER BY created_at DESC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1';
    const countParams = [req.user.id];
    if (is_read !== undefined) {
      countQuery += ' AND is_read = $2';
      countParams.push(is_read === 'true');
    }
    
    const countResult = await query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE notifications SET is_read = true
       WHERE user_id = $1 AND is_read = false
       RETURNING COUNT(*) as count`,
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
