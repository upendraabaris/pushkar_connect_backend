# OTP Verification Setup Guide

## Overview

The system now includes email-based OTP (One-Time Password) verification for enhanced security. Users need to provide both password and OTP to login.

## How It Works

### Login Flow:
1. User requests OTP via `/api/auth/send-otp` (provides email)
2. System sends 6-digit OTP to user's email
3. User logs in via `/api/auth/login` (provides email, password, and OTP)
4. System verifies password and OTP
5. If both are valid, JWT token is issued

## Database Setup

Run the updated `database_schema.sql` file which includes the `otps` table:

```sql
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'login', 'registration', 'password_reset'
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Email Configuration

### Option 1: Development Mode (Console Log)
By default, in development mode, emails are logged to console. No configuration needed.

### Option 2: SMTP Configuration (Production)
Add these variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@mla.gov.in
```

### Gmail Setup:
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASSWORD`

### Other SMTP Providers:
- **SendGrid**: Use `smtp.sendgrid.net`, port 587
- **Mailgun**: Use `smtp.mailgun.org`, port 587
- **Outlook**: Use `smtp-mail.outlook.com`, port 587
- **Custom SMTP**: Configure according to your provider's settings

## API Endpoints

### 1. Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "login"  // optional: 'login', 'registration', 'password_reset'
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "expiresIn": 600  // seconds (10 minutes)
  }
}
```

### 2. Verify OTP (Optional - can verify separately)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "login"
}
```

### 3. Login with OTP
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "User Name",
      "email": "user@example.com",
      "role": "admin"
    },
    "token": "jwt_token_here"
  }
}
```

## OTP Features

- **6-digit OTP**: Randomly generated secure code
- **10-minute expiration**: OTPs expire after 10 minutes
- **One-time use**: OTPs can only be used once
- **Rate limiting**: Maximum 1 OTP per email per minute
- **Automatic cleanup**: Expired OTPs are automatically cleaned up

## Security Features

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **Single Use**: Each OTP can only be used once
3. **Rate Limiting**: Prevents OTP spam (1 per minute)
4. **Email Validation**: OTPs are sent only to registered email addresses (for login)
5. **Purpose-based**: OTPs are tied to specific purposes (login, registration, etc.)

## Testing in Development

In development mode (without SMTP configuration), OTPs are logged to console:
```
==================================================
EMAIL WOULD BE SENT (Development Mode):
To: user@example.com
Subject: Login Verification - OTP Code
Body: [OTP content]
==================================================
```

You can check the console to see the OTP code during development.

## Troubleshooting

### OTP Not Received
1. Check spam/junk folder
2. Verify SMTP configuration in `.env`
3. Check server logs for errors
4. Verify email address is correct

### OTP Expired
- OTPs expire after 10 minutes
- Request a new OTP using `/api/auth/send-otp`

### Rate Limiting
- Maximum 1 OTP per email per minute
- Wait 1 minute before requesting another OTP

### SMTP Errors
- Verify SMTP credentials
- Check firewall/network settings
- For Gmail, ensure App Password is used (not regular password)
- Check SMTP port (587 for TLS, 465 for SSL)

## Environment Variables

Add to `.env`:
```env
# SMTP Configuration (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@mla.gov.in
```

## Notes

- Password field is still required and not removed
- OTP is an additional security layer
- All roles (admin, staff, citizen) use OTP verification
- OTPs are automatically cleaned up from database after use/expiration
