const { query } = require('../config/database');
const { generateComplaintId } = require('../utils/generateId');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, category, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
    
    let queryText = `
      SELECT c.*, u.name as assigned_to_name
      FROM complaints c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND c.status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND c.category = $${paramCount++}`;
      params.push(category);
    }

    if (dateFrom) {
      queryText += ` AND c.created_at >= $${paramCount++}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      queryText += ` AND c.created_at <= $${paramCount++}`;
      params.push(dateTo);
    }

    queryText += ` ORDER BY c.created_at DESC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count FROM complaints WHERE 1=1
      ${status ? 'AND status = $1' : ''}
      ${category ? `AND category = $${status ? '2' : '1'}` : ''}
    `;
    const countParams = [];
    if (status) countParams.push(status);
    if (category) countParams.push(category);
    
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

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT c.*, u.name as assigned_to_name
       FROM complaints c
       LEFT JOIN users u ON c.assigned_to = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
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

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const {
      citizen_name,
      citizen_phone,
      citizen_email,
      citizen_address,
      category,
      subcategory,
      title,
      description,
      priority,
      location,
      images
    } = req.body;

    const complaint_id = generateComplaintId();

    const result = await query(
      `INSERT INTO complaints (
        complaint_id, citizen_name, citizen_phone, citizen_email, citizen_address,
        category, subcategory, title, description, priority, location, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        complaint_id, citizen_name, citizen_phone || null, citizen_email || null,
        citizen_address || null, category, subcategory || null, title, description,
        priority || 'medium', location ? JSON.stringify(location) : null,
        images ? images : null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      assigned_to,
      priority,
      resolution_notes
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
      if (status === 'resolved') {
        updates.push(`resolved_at = CURRENT_TIMESTAMP`);
      }
    }

    if (assigned_to) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assigned_to);
    }

    if (priority) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (resolution_notes !== undefined) {
      updates.push(`resolution_notes = $${paramCount++}`);
      values.push(resolution_notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE complaints SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM complaints WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
};
