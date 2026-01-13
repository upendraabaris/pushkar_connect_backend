const { query } = require('../config/database');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// OTP expiration time (10 minutes)
const OTP_EXPIRATION_MINUTES = 10;

// Send OTP to email
const sendOTP = async (email, purpose = 'login') => {
  try {
    // Check if user exists (for login/registration purposes)
    if (purpose === 'login') {
      const userCheck = await query(
        'SELECT id, email, is_active FROM users WHERE email = $1',
        [email]
      );

      if (userCheck.rows.length === 0) {
        return {
          success: false,
          message: 'User not found with this email'
        };
      }

      if (!userCheck.rows[0].is_active) {
        return {
          success: false,
          message: 'User account is inactive'
        };
      }
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Delete old unused OTPs for this email and purpose
    await query(
      'DELETE FROM otps WHERE email = $1 AND purpose = $2 AND is_used = false AND expires_at < NOW()',
      [email, purpose]
    );

    // Check for recent OTP (prevent spam - max 1 OTP per minute)
    const recentOTP = await query(
      `SELECT id FROM otps 
       WHERE email = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '1 minute'`,
      [email, purpose]
    );

    if (recentOTP.rows.length > 0) {
      return {
        success: false,
        message: 'OTP already sent. Please wait 1 minute before requesting another.'
      };
    }

    // Save OTP to database
    await query(
      `INSERT INTO otps (email, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [email, otpCode, purpose, expiresAt]
    );

    // Send OTP via email
    const emailService = require('./emailService');
    await emailService.sendOTPEmail(email, otpCode, purpose);

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: OTP_EXPIRATION_MINUTES * 60 // seconds
    };
  } catch (error) {
    console.error('Error in sendOTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email, otpCode, purpose = 'login') => {
  try {
    // Find valid OTP
    const result = await query(
      `SELECT id, expires_at, is_used FROM otps
       WHERE email = $1 AND otp_code = $2 AND purpose = $3 AND is_used = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, otpCode, purpose]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Invalid or expired OTP'
      };
    }

    const otp = result.rows[0];

    // Check if OTP is expired
    if (new Date(otp.expires_at) < new Date()) {
      // Mark as used (cleanup)
      await query('UPDATE otps SET is_used = true WHERE id = $1', [otp.id]);
      return {
        success: false,
        message: 'OTP has expired'
      };
    }

    // Mark OTP as used
    await query('UPDATE otps SET is_used = true WHERE id = $1', [otp.id]);

    // Delete all old OTPs for this email and purpose (cleanup)
    await query(
      'DELETE FROM otps WHERE email = $1 AND purpose = $2 AND is_used = true',
      [email, purpose]
    );

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    throw error;
  }
};

// Cleanup expired OTPs (can be run periodically)
const cleanupExpiredOTPs = async () => {
  try {
    const result = await query(
      'DELETE FROM otps WHERE expires_at < NOW() OR (is_used = true AND created_at < NOW() - INTERVAL \'1 day\')'
    );
    console.log(`Cleaned up ${result.rowCount} expired OTPs`);
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  cleanupExpiredOTPs,
  OTP_EXPIRATION_MINUTES,
};
