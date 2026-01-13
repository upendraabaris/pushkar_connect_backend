const { query } = require('../config/database');
const { generateWorkId } = require('../utils/generateId');

// @desc    Get all development works
// @route   GET /api/development-works
// @access  Private
const getDevelopmentWorks = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    let queryText = `
      SELECT dw.*, u.name as assigned_to_name
      FROM development_works dw
      LEFT JOIN users u ON dw.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND dw.status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND dw.category = $${paramCount++}`;
      params.push(category);
    }

    queryText += ` ORDER BY dw.created_at DESC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM development_works WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = $1';
      countParams.push(status);
    }
    if (category) {
      countQuery += ` AND category = $${status ? '2' : '1'}`;
      countParams.push(category);
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

// @desc    Get single development work
// @route   GET /api/development-works/:id
// @access  Private
const getDevelopmentWork = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT dw.*, u.name as assigned_to_name
       FROM development_works dw
       LEFT JOIN users u ON dw.assigned_to = u.id
       WHERE dw.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Development work not found'
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

// @desc    Create development work
// @route   POST /api/development-works
// @access  Private
const createDevelopmentWork = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      status,
      budget_amount,
      allocated_amount,
      location,
      start_date,
      estimated_completion_date,
      contractor_name,
      contractor_contact,
      images,
      videos,
      documents,
      assigned_to
    } = req.body;

    const work_id = generateWorkId();

    const result = await query(
      `INSERT INTO development_works (
        work_id, title, description, category, status, budget_amount, allocated_amount,
        location, start_date, estimated_completion_date, contractor_name, contractor_contact,
        images, videos, documents, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        work_id, title, description, category || null, status || 'planned',
        budget_amount || null, allocated_amount || null,
        location ? JSON.stringify(location) : null,
        start_date || null, estimated_completion_date || null,
        contractor_name || null, contractor_contact || null,
        images || null, videos || null, documents || null,
        assigned_to || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Development work created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update development work
// @route   PUT /api/development-works/:id
// @access  Private
const updateDevelopmentWork = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'description', 'category', 'status', 'budget_amount',
      'allocated_amount', 'spent_amount', 'location', 'start_date',
      'completion_date', 'estimated_completion_date', 'contractor_name',
      'contractor_contact', 'images', 'videos', 'documents', 'assigned_to'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'location' && typeof req.body[field] === 'object') {
          updates.push(`${field} = $${paramCount++}`);
          values.push(JSON.stringify(req.body[field]));
        } else {
          updates.push(`${field} = $${paramCount++}`);
          values.push(req.body[field]);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE development_works SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Development work not found'
      });
    }

    res.json({
      success: true,
      message: 'Development work updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete development work
// @route   DELETE /api/development-works/:id
// @access  Private/Admin
const deleteDevelopmentWork = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM development_works WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Development work not found'
      });
    }

    res.json({
      success: true,
      message: 'Development work deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDevelopmentWorks,
  getDevelopmentWork,
  createDevelopmentWork,
  updateDevelopmentWork,
  deleteDevelopmentWork,
};
