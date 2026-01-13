const { query } = require('../config/database');
const { generateEventId } = require('../utils/generateId');

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    let queryText = `
      SELECT e.*, u.name as organized_by_name
      FROM events e
      LEFT JOIN users u ON e.organized_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND e.status = $${paramCount++}`;
      params.push(status);
    }

    if (category) {
      queryText += ` AND e.category = $${paramCount++}`;
      params.push(category);
    }

    queryText += ` ORDER BY e.event_date ASC`;
    
    const offset = (page - 1) * limit;
    queryText += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM events WHERE 1=1';
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

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT e.*, u.name as organized_by_name
       FROM events e
       LEFT JOIN users u ON e.organized_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
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

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      event_date,
      event_time,
      end_date,
      end_time,
      location,
      location_coordinates,
      status,
      expected_attendance,
      images,
      videos,
      agenda,
      organized_by
    } = req.body;

    const event_id = generateEventId();

    const result = await query(
      `INSERT INTO events (
        event_id, title, description, category, event_date, event_time, end_date, end_time,
        location, location_coordinates, status, expected_attendance, images, videos, agenda, organized_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        event_id, title, description || null, category || null,
        event_date, event_time || null, end_date || null, end_time || null,
        location || null, location_coordinates ? JSON.stringify(location_coordinates) : null,
        status || 'upcoming', expected_attendance || null,
        images || null, videos || null, agenda || null,
        organized_by || req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'title', 'description', 'category', 'event_date', 'event_time',
      'end_date', 'end_time', 'location', 'location_coordinates', 'status',
      'expected_attendance', 'actual_attendance', 'images', 'videos', 'agenda'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'location_coordinates' && typeof req.body[field] === 'object') {
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
      `UPDATE events SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM events WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
