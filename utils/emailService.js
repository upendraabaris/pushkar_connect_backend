const nodemailer = require('nodemailer');

// Create transporter for sending emails
const createTransporter = () => {
  // For development, you can use Ethereal Email (fake SMTP) or configure real SMTP
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    // Using console log for development (you can configure real SMTP later)
    return {
      sendMail: async (options) => {
        console.log('='.repeat(50));
        console.log('EMAIL WOULD BE SENT (Development Mode):');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text);
        console.log('='.repeat(50));
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  // Production SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send OTP Email
const sendOTPEmail = async (email, otpCode, purpose = 'login') => {
  try {
    const transporter = createTransporter();

    const purposeText = {
      login: 'Login Verification',
      registration: 'Registration Verification',
      password_reset: 'Password Reset Verification'
    }[purpose] || 'Verification';

    const subject = `${purposeText} - OTP Code`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9933; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; margin: 20px 0; }
          .otp-box { background-color: #ffffff; border: 2px dashed #FF9933; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #FF9933; letter-spacing: 5px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { color: #d9534f; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>MLA Public Engagement Platform</h2>
          </div>
          <div class="content">
            <h3>${purposeText}</h3>
            <p>Hello,</p>
            <p>Your OTP (One-Time Password) for ${purposeText.toLowerCase()} is:</p>
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong> only.</p>
            <p class="warning">⚠️ Do not share this OTP with anyone. Our team will never ask for your OTP.</p>
            <p>If you did not request this OTP, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} MLA Public Engagement Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
MLA Public Engagement Platform
${purposeText}

Your OTP Code is: ${otpCode}

This OTP is valid for 10 minutes only.

Do not share this OTP with anyone. If you did not request this OTP, please ignore this email.

This is an automated message. Please do not reply to this email.
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@mla.gov.in',
      to: email,
      subject: subject,
      text: text,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOTPEmail,
};
