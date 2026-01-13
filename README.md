# MLA Public Engagement Platform - Backend API

Backend API for MLA Public Engagement Platform Admin Panel built with Node.js, Express.js, and PostgreSQL.

## Features

- 🔐 JWT Authentication & Authorization
- 📧 Email-based OTP Verification
- 👥 User/Staff Management
- 📝 Complaints Management
- 🏗️ Development Works Management
- 📅 Events Management
- 📰 Media Management
- 🏛️ Smart City Schemes Management
- 💬 MLA Connect (Public Queries/Feedback)
- 📊 Dashboard Analytics
- 🔔 Notifications
- ⚙️ Settings Management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- pgAdmin (for database management)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pushkar_connect_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update the database credentials and other configuration in `.env`:
     ```env
     PORT=3000
     NODE_ENV=development
     DB_HOST=localhost
     DB_PORT=5432
     DB_NAME=mla_platform
     DB_USER=postgres
     DB_PASSWORD=your_password
     JWT_SECRET=your-secret-key
     JWT_EXPIRE=7d
     BCRYPT_SALT_ROUNDS=10
     
     # SMTP Configuration (Optional for development)
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your-email@gmail.com
     SMTP_PASSWORD=your-app-password
     SMTP_FROM=noreply@mla.gov.in
     ```

4. **Create Database in PostgreSQL**
   - Open pgAdmin
   - Create a new database named `mla_platform` (or your preferred name)
   - Update `DB_NAME` in `.env` if using a different name

5. **Run Database Schema**
   - Open pgAdmin Query Tool
   - Open `database_schema.sql` file
   - Execute the SQL script to create all tables
   - **Note:** The default admin user password hash in the schema needs to be updated. After creating tables, manually update the admin password or create a new admin user via API.

6. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email (Public)
- `POST /api/auth/verify-otp` - Verify OTP (Public)
- `POST /api/auth/login` - Login user (requires email, password, and OTP)
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `POST /api/auth/register` - Register new user (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Protected)

### Complaints
- `GET /api/complaints` - Get all complaints (Protected)
- `GET /api/complaints/:id` - Get single complaint (Protected)
- `POST /api/complaints` - Create complaint (Protected)
- `PUT /api/complaints/:id` - Update complaint (Protected)
- `DELETE /api/complaints/:id` - Delete complaint (Admin only)

### Development Works
- `GET /api/development-works` - Get all development works (Protected)
- `GET /api/development-works/:id` - Get single work (Protected)
- `POST /api/development-works` - Create work (Protected)
- `PUT /api/development-works/:id` - Update work (Protected)
- `DELETE /api/development-works/:id` - Delete work (Admin only)

### Events
- `GET /api/events` - Get all events (Protected)
- `GET /api/events/:id` - Get single event (Protected)
- `POST /api/events` - Create event (Protected)
- `PUT /api/events/:id` - Update event (Protected)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Media
- `GET /api/media` - Get all media (Protected)
- `GET /api/media/:id` - Get single media (Protected)
- `POST /api/media` - Create media (Protected)
- `PUT /api/media/:id` - Update media (Protected)
- `DELETE /api/media/:id` - Delete media (Protected)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Schemes
- `GET /api/schemes` - Get all schemes (Protected)
- `GET /api/schemes/:id` - Get single scheme (Protected)
- `POST /api/schemes` - Create scheme (Protected)
- `PUT /api/schemes/:id` - Update scheme (Protected)
- `DELETE /api/schemes/:id` - Delete scheme (Admin only)

### MLA Connect
- `GET /api/mla-connect` - Get all queries (Protected)
- `GET /api/mla-connect/:id` - Get single query (Protected)
- `POST /api/mla-connect` - Create query (Protected)
- `PUT /api/mla-connect/:id` - Update query (Protected)
- `DELETE /api/mla-connect/:id` - Delete query (Admin only)

### Notifications
- `GET /api/notifications` - Get all notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (Protected)
- `PUT /api/notifications/read-all` - Mark all as read (Protected)

### Settings
- `GET /api/settings` - Get all settings (Admin only)
- `GET /api/settings/:key` - Get single setting (Admin only)
- `POST /api/settings` - Create/update setting (Admin only)
- `PUT /api/settings/:key` - Update setting (Admin only)
- `DELETE /api/settings/:key` - Delete setting (Admin only)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The database schema is defined in `database_schema.sql`. Run this script in pgAdmin to create all necessary tables.

**Important Tables:**
- `users` - User accounts (admin, staff, citizen)
- `complaints` - Citizen complaints
- `development_works` - Development projects
- `events` - Events and programs
- `media` - Media files and press releases
- `schemes` - Government schemes
- `mla_connect` - Public queries and feedback
- `notifications` - User notifications
- `settings` - System settings

## Project Structure

```
pushkar_connect_backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route controllers
│   ├── authController.js
│   ├── complaintController.js
│   ├── dashboardController.js
│   ├── developmentWorkController.js
│   ├── eventController.js
│   ├── mediaController.js
│   ├── mlaConnectController.js
│   ├── schemeController.js
│   └── userController.js
├── middleware/              # Express middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validator.js
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── dashboardRoutes.js
│   ├── developmentWorkRoutes.js
│   ├── eventRoutes.js
│   ├── mediaRoutes.js
│   ├── mlaConnectRoutes.js
│   ├── notificationRoutes.js
│   ├── schemeRoutes.js
│   ├── settingRoutes.js
│   └── userRoutes.js
├── utils/                   # Utility functions
│   └── generateId.js
├── database_schema.sql      # Database schema
├── server.js                # Main server file
├── index.js                 # Entry point
├── package.json
└── README.md
```

## Default Admin User

After running the database schema, you'll need to:
1. Update the default admin password in the database, OR
2. Create a new admin user via the API (requires another admin account)

**To create a default admin user manually:**
1. Use a bcrypt hash generator or create a user via API after first admin setup
2. Recommended: Create first admin user directly in database with a proper password hash

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | mla_platform |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | postgres |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration | 7d |
| BCRYPT_SALT_ROUNDS | Bcrypt salt rounds | 10 |
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_SECURE | Use secure connection | false |
| SMTP_USER | SMTP username/email | - |
| SMTP_PASSWORD | SMTP password/app password | - |
| SMTP_FROM | From email address | noreply@mla.gov.in |

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## License

ISC
"# pushkar_connect_backend" 
