# Roles and Permissions Guide

## Current Implementation Status

✅ **BASIC ROLE-BASED ACCESS CONTROL (RBAC) - IMPLEMENTED & WORKING**

## Roles in System

The system has 3 roles defined in the database:

1. **`admin`** - Full access to everything
2. **`staff`** - Limited access (can manage assigned items)
3. **`citizen`** - Citizen access (limited features)

## Current Access Control

### ✅ Admin Only Routes (Fully Protected)
- `/api/users/*` - All user management routes
- `/api/settings/*` - All settings routes
- `POST /api/auth/register` - User registration

### ✅ Admin Only Actions (Specific Operations)
- `DELETE /api/complaints/:id` - Delete complaints
- `DELETE /api/development-works/:id` - Delete development works
- `DELETE /api/events/:id` - Delete events
- `DELETE /api/schemes/:id` - Delete schemes
- `DELETE /api/mla-connect/:id` - Delete MLA connect queries

### ✅ Authenticated Users (All Roles)
All other routes require authentication but can be accessed by any logged-in user (admin, staff, citizen):
- Dashboard statistics
- View/create/update complaints
- View/create/update development works
- View/create/update events
- View/create/update media
- View/create/update schemes
- View/create/update MLA connect queries
- View/manage notifications

## How It Works

### 1. Authentication Middleware (`authMiddleware`)
- Checks for JWT token in Authorization header
- Verifies token validity
- Fetches user from database
- Attaches user object (with role) to `req.user`

### 2. Authorization Middleware (`authorize`)
- Checks if user has required role
- Returns 403 if role doesn't match
- Example: `authorize('admin')` - only admin can access

### 3. Route Protection Examples

```javascript
// All routes require admin
router.use(authMiddleware);
router.use(authorize('admin'));

// Specific route requires admin
router.delete('/:id', authorize('admin'), deleteComplaint);

// Multiple roles allowed
router.get('/:id', authorize('admin', 'staff'), getComplaint);
```

## Usage in API Calls

### Login and Get Token
```bash
POST /api/auth/login
Body: { "email": "admin@mla.gov.in", "password": "password" }
Response: { "data": { "user": {...}, "token": "jwt_token_here" } }
```

### Use Token in Requests
```bash
GET /api/complaints
Headers: { "Authorization": "Bearer jwt_token_here" }
```

### Admin Access
```bash
GET /api/users
Headers: { "Authorization": "Bearer admin_token_here" }
```

### Non-Admin Trying Admin Route
```bash
GET /api/users
Headers: { "Authorization": "Bearer staff_token_here" }
Response: 403 - "Access denied. Insufficient permissions."
```

## Current Limitations

❌ **Not Implemented (If Needed):**
1. **Granular Permissions** - Permission-based access (e.g., "can_view_complaints", "can_edit_complaints")
2. **Role-based Data Filtering** - Staff can only see their assigned items
3. **Permission Table** - Database table for permissions
4. **Permission Assignment** - Assign permissions to roles/users

## If You Need Advanced Permissions

If you need more granular control (e.g., specific permissions per action), you would need:

1. **Permissions Table** in database
2. **Role-Permission Mapping Table**
3. **Permission Middleware** to check specific permissions
4. **Permission-based Route Protection**

Example structure:
```
permissions table:
- id, name, resource, action (e.g., "view_complaints", "edit_complaints")

role_permissions table:
- role_id, permission_id

Then use: authorizePermission('view_complaints')
```

## Recommendation

✅ **Current system is sufficient for:**
- Admin has full access
- Staff/Citizen can access most features
- Delete operations restricted to admin
- User management restricted to admin

✅ **Current system will work automatically** - no additional setup needed!

❌ **Upgrade needed only if:**
- You need staff to have different permissions (e.g., staff can view but not edit)
- You need role-specific data filtering
- You need custom permission assignment per user
