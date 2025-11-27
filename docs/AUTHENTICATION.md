# User Authentication with SQLite

## Overview

Chukfi CMS now uses SQLite as the backend database for managing user accounts. This allows you to add, remove, and manage user accounts programmatically through the Go backend API.

## Default Admin Account

The system automatically creates a default admin account on first startup:

- **Email**: `admin@chukfi.com`
- **Password**: `admin123`

You can use these credentials to sign in at `/login`.

## Database Schema

The SQLite database includes the following tables:

### Users Table

- `id` - Unique user identifier (UUID)
- `email` - User email address (unique)
- `password_hash` - Bcrypt hashed password
- `display_name` - User's display name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Roles Table

- `id` - Unique role identifier (UUID)
- `name` - Role name (e.g., "Admin", "Editor", "Author")
- `description` - Role description
- `created_at` - Role creation timestamp
- `updated_at` - Last update timestamp

### User Roles Junction Table

- `user_id` - Reference to users table
- `role_id` - Reference to roles table
- `created_at` - Assignment timestamp

## Starting the Backend Server

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Ensure Go dependencies are installed:

   ```bash
   go mod tidy
   ```

3. Start the server:
   ```bash
   go run cmd/server/main.go
   ```

The server will:

- Start on port 8080 (configurable via `.env`)
- Create the SQLite database at `./data/chukfi.db` if it doesn't exist
- Automatically initialize tables and create the default admin account
- Enable CORS for `http://localhost:4321` (frontend)

## API Endpoints

### Authentication

#### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@chukfi.com",
  "password": "admin123"
}

Response:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "uuid",
    "email": "admin@chukfi.com",
    "displayName": "Admin User",
    "roles": [...]
  }
}
```

#### Get Current User

```
GET /api/v1/auth/me
Authorization: Bearer {accessToken}
```

#### Logout

```
POST /api/v1/auth/logout
Authorization: Bearer {accessToken}
```

### User Management

#### Get All Users

```
GET /api/v1/users
Authorization: Bearer {accessToken}
```

#### Create User

```
POST /api/v1/users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword",
  "displayName": "New User",
  "roleIds": ["role-uuid"]
}
```

#### Update User

```
PATCH /api/v1/users/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "displayName": "Updated Name",
  "roleIds": ["role-uuid"]
}
```

#### Delete User

```
DELETE /api/v1/users/{id}
Authorization: Bearer {accessToken}
```

## Frontend Integration

The login page at `/login` now connects to the backend API:

1. User enters credentials
2. Frontend sends POST request to `/api/v1/auth/login`
3. Backend validates credentials against SQLite database
4. Backend returns JWT access and refresh tokens
5. Frontend stores tokens in localStorage
6. Frontend redirects to `/admin` dashboard

### Protected Routes

Admin pages check for authentication token in localStorage:

- If token exists → Allow access to admin dashboard
- If token missing → Redirect to `/login`

## Adding New Users

### Via API (Recommended)

Use the API endpoints above with proper authentication.

### Via Database (Development Only)

You can also add users directly to the SQLite database:

```bash
# Connect to the database
sqlite3 backend/data/chukfi.db

# Insert a new user (password: "newpassword")
INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
  'user-uuid-here',
  'newuser@example.com',
  '$2a$14$hashedpasswordhere',
  'New User',
  datetime('now'),
  datetime('now')
);

# Assign admin role
INSERT INTO user_roles (user_id, role_id)
VALUES ('user-uuid-here', 'admin-role-id');
```

**Note**: To generate a bcrypt hash for passwords, you can use online tools or the Go bcrypt package.

## Security Notes

1. **Change JWT Secret**: Update `JWT_SECRET` in `.env` for production
2. **Use Strong Passwords**: Enforce strong password policies
3. **HTTPS in Production**: Always use HTTPS in production environments
4. **Regular Backups**: Backup your SQLite database regularly
5. **Update Default Admin**: Change the default admin password after first login

## Troubleshooting

### "Unable to connect to server"

- Ensure the backend server is running on port 8080
- Check that CORS is properly configured
- Verify `.env` file has correct settings

### "Invalid credentials"

- Double-check email and password
- Ensure user exists in database
- Check backend logs for authentication errors

### Database Locked

- Close any other connections to the SQLite database
- Restart the backend server

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=8080

# Database Configuration
DATABASE_URL=sqlite://./data/chukfi.db

# JWT Secret (change in production!)
JWT_SECRET=your-secret-key-change-in-production
```

## Development Workflow

1. **Start Backend**:

   ```bash
   cd backend
   go run cmd/server/main.go
   ```

2. **Start Frontend** (in another terminal):

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:4321
   - Backend API: http://localhost:8080
   - Login Page: http://localhost:4321/login
   - Admin Dashboard: http://localhost:4321/admin

## Next Steps

- Implement user management UI in the admin dashboard
- Add role-based permission checking
- Implement password reset functionality
- Add email verification for new accounts
- Set up database migrations for schema updates
