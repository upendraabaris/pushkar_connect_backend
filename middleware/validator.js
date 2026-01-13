// Validation middleware for common validations

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

const validateRequest = (req, res, next) => {
  // This is a placeholder - you can extend this for specific validations
  next();
};

// Validation middleware for complaint creation
const validateComplaint = (req, res, next) => {
  const { citizen_name, category, title, description } = req.body;

  if (!citizen_name || !category || !title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: citizen_name, category, title, description'
    });
  }

  if (req.body.citizen_email && !validateEmail(req.body.citizen_email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  next();
};

// Validation middleware for event creation
const validateEvent = (req, res, next) => {
  const { title, event_date } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, event_date'
    });
  }

  next();
};

// Validation middleware for development work creation
const validateDevelopmentWork = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, description'
    });
  }

  next();
};

module.exports = {
  validateRequest,
  validateComplaint,
  validateEvent,
  validateDevelopmentWork,
  validateEmail,
  validatePhone,
};
