const { query } = require('../config/database');
const { generateSchemeId } = require('../utils/generateId');

// @desc    Get all schemes
// @route   GET /api/schemes
// @access  Private
const getSchemes = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    let queryText = `
      SELECT * FROM schemes WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    queryText += ` ORDER BY created_at DESC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM schemes WHERE 1=1';
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

// @desc    Get single scheme
// @route   GET /api/schemes/:id
// @access  Private
const getScheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM schemes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
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

// @desc    Create scheme
// @route   POST /api/schemes
// @access  Private
const createScheme = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      status,
      eligibility_criteria,
      benefits,
      application_process,
      documents_required,
      official_link,
      contact_info,
      start_date,
      end_date,
      images,
      documents
    } = req.body;

    const scheme_id = generateSchemeId();

    const result = await query(
      `INSERT INTO schemes (
        scheme_id, name, description, category, status, eligibility_criteria, benefits,
        application_process, documents_required, official_link, contact_info,
        start_date, end_date, images, documents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        scheme_id, name, description || null, category || null, status || 'active',
        eligibility_criteria || null, benefits || null, application_process || null,
        documents_required || null, official_link || null,
        contact_info ? JSON.stringify(contact_info) : null,
        start_date || null, end_date || null, images || null, documents || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update scheme
// @route   PUT /api/schemes/:id
// @access  Private
const updateScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'name', 'description', 'category', 'status', 'eligibility_criteria',
      'benefits', 'application_process', 'documents_required', 'official_link',
      'contact_info', 'start_date', 'end_date', 'images', 'documents'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'contact_info' && typeof req.body[field] === 'object') {
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
      `UPDATE schemes SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.json({
      success: true,
      message: 'Scheme updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete scheme
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM schemes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    res.json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme,
};
