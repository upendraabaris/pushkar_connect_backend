const { query } = require('../config/database');
const { generateMediaId } = require('../utils/generateId');

// @desc    Get all media
// @route   GET /api/media
// @access  Private
const getMedia = async (req, res, next) => {
  try {
    const { type, category, page = 1, limit = 20 } = req.query;
    
    let queryText = `
      SELECT m.*, u.name as uploaded_by_name
      FROM media m
      LEFT JOIN users u ON m.uploaded_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      queryText += ` AND m.type = $${paramCount++}`;
      params.push(type);
    }

    if (category) {
      queryText += ` AND m.category = $${paramCount++}`;
      params.push(category);
    }

    queryText += ` ORDER BY m.created_at DESC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM media WHERE 1=1';
    const countParams = [];
    if (type) {
      countQuery += ' AND type = $1';
      countParams.push(type);
    }
    if (category) {
      countQuery += ` AND category = $${type ? '2' : '1'}`;
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

// @desc    Get single media
// @route   GET /api/media/:id
// @access  Private
const getMediaItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT m.*, u.name as uploaded_by_name
       FROM media m
       LEFT JOIN users u ON m.uploaded_by = u.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
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

// @desc    Create media
// @route   POST /api/media
// @access  Private
const createMedia = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      file_url,
      thumbnail_url,
      category,
      tags,
      source,
      published_date,
      is_featured
    } = req.body;

    if (!type || !file_url) {
      return res.status(400).json({
        success: false,
        message: 'Type and file_url are required'
      });
    }

    const media_id = generateMediaId();

    const result = await query(
      `INSERT INTO media (
        media_id, title, description, type, file_url, thumbnail_url, category,
        tags, source, published_date, is_featured, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        media_id, title || null, description || null, type, file_url,
        thumbnail_url || null, category || null, tags || null,
        source || null, published_date || null, is_featured || false,
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Media created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update media
// @route   PUT /api/media/:id
// @access  Private
const updateMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'description', 'file_url', 'thumbnail_url', 'category',
      'tags', 'source', 'published_date', 'is_featured'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramCount++}`);
        values.push(req.body[field]);
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
      `UPDATE media SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM media WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Media not found'
      });
    }

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
  getMediaItem,
  createMedia,
  updateMedia,
  deleteMedia,
};
