const { query } = require('../config/database');
const { generateQueryId } = require('../utils/generateId');

// @desc    Get all MLA Connect queries
// @route   GET /api/mla-connect
// @access  Private
const getMlaConnectQueries = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    let queryText = `
      SELECT mc.*, u.name as assigned_to_name, u2.name as responded_by_name
      FROM mla_connect mc
      LEFT JOIN users u ON mc.assigned_to = u.id
      LEFT JOIN users u2 ON mc.responded_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND mc.status = $${paramCount++}`;
      params.push(status);
    }

    if (type) {
      queryText += ` AND mc.type = $${paramCount++}`;
      params.push(type);
    }

    queryText += ` ORDER BY mc.created_at DESC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM mla_connect WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = $1';
      countParams.push(status);
    }
    if (type) {
      countQuery += ` AND type = $${status ? '2' : '1'}`;
      countParams.push(type);
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
};

// @desc    Get single MLA Connect query
// @route   GET /api/mla-connect/:id
// @access  Private
const getMlaConnectQuery = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT mc.*, u.name as assigned_to_name, u2.name as responded_by_name
       FROM mla_connect mc
       LEFT JOIN users u ON mc.assigned_to = u.id
       LEFT JOIN users u2 ON mc.responded_by = u2.id
       WHERE mc.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create MLA Connect query
// @route   POST /api/mla-connect
// @access  Private
const createMlaConnectQuery = async (req, res, next) => {
  try {
    const {
      citizen_name,
      citizen_phone,
      citizen_email,
      subject,
      message,
      type,
      priority
    } = req.body;

    const query_id = generateQueryId();

    const result = await query(
      `INSERT INTO mla_connect (
        query_id, citizen_name, citizen_phone, citizen_email, subject, message, type, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        query_id, citizen_name, citizen_phone || null, citizen_email || null,
        subject || null, message, type || 'query', priority || 'medium'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Query created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update MLA Connect query
// @route   PUT /api/mla-connect/:id
// @access  Private
const updateMlaConnectQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, priority, response } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (assigned_to) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assigned_to);
    }

    if (priority) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (response !== undefined) {
      updates.push(`response = $${paramCount++}`);
      values.push(response);
      updates.push(`responded_at = CURRENT_TIMESTAMP`);
      updates.push(`responded_by = $${paramCount++}`);
      values.push(req.user.id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE mla_connect SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.json({
      success: true,
      message: 'Query updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete MLA Connect query
// @route   DELETE /api/mla-connect/:id
// @access  Private/Admin
const deleteMlaConnectQuery = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM mla_connect WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.json({
      success: true,
      message: 'Query deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMlaConnectQueries,
  getMlaConnectQuery,
  createMlaConnectQuery,
  updateMlaConnectQuery,
  deleteMlaConnectQuery,
};
