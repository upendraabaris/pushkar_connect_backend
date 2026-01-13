const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(authMiddleware);
router.use(authorize('admin'));

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM settings ORDER BY key ASC'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single setting
// @route   GET /api/settings/:key
// @access  Private/Admin
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const result = await query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create or update setting
// @route   POST /api/settings
// @route   PUT /api/settings/:key
// @access  Private/Admin
router.post('/', async (req, res, next) => {
  try {
    const { key, value, type, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }

    const result = await query(
      `INSERT INTO settings (key, value, type, description, updated_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (key) DO UPDATE SET
         value = EXCLUDED.value,
         type = EXCLUDED.type,
         description = EXCLUDED.description,
         updated_by = EXCLUDED.updated_by,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value, type || 'string', description || null, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Setting created/updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, type, description } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (value !== undefined) {
      updates.push(`value = $${paramCount++}`);
      values.push(value);
    }

    if (type) {
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    updates.push(`updated_by = $${paramCount++}`);
    values.push(req.user.id);

    values.push(key);

    const result = await query(
      `UPDATE settings SET ${updates.join(', ')}
       WHERE key = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete setting
// @route   DELETE /api/settings/:key
// @access  Private/Admin
router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const result = await query(
      'DELETE FROM settings WHERE key = $1 RETURNING key',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
