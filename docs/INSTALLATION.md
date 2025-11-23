# 🚀 Installation Guide

Get Chukfi CMS up and running in **5 minutes** with zero external dependencies.

## Prerequisites (One-time setup)

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Go 1.21+** - Download from [golang.org/dl](https://golang.org/dl)
- **Git** - For cloning the repository

## Installation Methods

### 🎯 Method 1: Use GitHub Template (Recommended)

1. **Create from template**

   - Click **"Use this template"** button on the [repository page](https://github.com/Native-Consulting-Services/chukfi-cms)
   - Name your new repository
   - Clone your new repository locally

2. **Setup dependencies**

   ```bash
   # Navigate to project
   cd your-cms-name

   # Install frontend dependencies
   cd frontend && npm install && cd ..

   # Install backend dependencies
   cd backend && go mod tidy && cd ..
   ```

3. **Initialize database**

   ```bash
   cd backend
   mkdir -p data
   go run cmd/migrate/main.go up
   cd ..
   ```

4. **Start development servers**

   ```bash
   # Option A: VS Code (Recommended)
   # Open in VS Code, then Ctrl+Shift+P → "Tasks: Run Task" → "Start Development Environment"

   # Option B: Manual (Two terminals)
   # Terminal 1:
   cd frontend && npm run dev

   # Terminal 2:
   cd backend && go run cmd/server/main.go
   ```

### 🔧 Method 2: Direct Clone (For Contributing)

```bash
# Clone repository
git clone https://github.com/Native-Consulting-Services/chukfi-cms.git
cd chukfi-cms

# Follow steps 2-4 from Method 1
```

## ✅ Verification

After installation, verify everything is working:

- **Frontend**: http://localhost:4321 ✅
- **Admin Dashboard**: http://localhost:4321/admin ✅
- **Backend API**: http://localhost:8080/health ✅
- **Default Login**: admin@chukfi.com / admin123 ✅

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Start backend on different port
cd backend && PORT=8081 go run cmd/server/main.go
```

### Database Issues

```bash
# Reset database
cd backend
rm -f data/chukfi.db
go run cmd/migrate/main.go up
```

### Frontend Issues

```bash
# Clear and reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Permission Errors (Linux/Mac)

```bash
# Make sure you have write permissions
chmod 755 backend/data
```

## ⚡ What Happens Behind the Scenes

### Database Setup

- **Pure SQLite** - No external database server needed
- **Automatic Creation** - `./backend/data/chukfi.db` file created
- **Schema Migration** - Complete CMS schema applied automatically
- **Default Admin User** - admin@chukfi.com / admin123 created

### Development Servers

- **Frontend**: Astro dev server with hot reload on port 4321
- **Backend**: Go HTTP server with SQLite on port 8080
- **No CGO/Docker** - Zero complex dependencies

### File Structure Created

```
your-project/
├── frontend/node_modules/     # Frontend packages (auto-created)
├── backend/data/              # SQLite database (auto-created)
│   └── chukfi.db             # Database file
├── backend/bin/              # Compiled binaries (optional)
└── .env files                # Environment config
```

## 🔧 Environment Configuration

Copy the environment template and customize if needed:

```bash
cp backend/.env.example backend/.env
```

Default configuration works out of the box:

```env
# Database (Pure Go SQLite)
DATABASE_URL=sqlite://./data/chukfi.db
DB_DRIVER=sqlite

# Server Configuration
PORT=8080
HOST=localhost
ENVIRONMENT=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

## 🎯 Next Steps

After successful installation:

1. 📖 **[Quick Start Tutorial](QUICK_START.md)** - Create your first collection
2. 🛠️ **[Development Guide](../DEVELOPMENT.md)** - Local development workflow
3. 🏗️ **[Collections Guide](guides/COLLECTIONS.md)** - Learn about content management
4. 👥 **[Users & Permissions](guides/USERS_PERMISSIONS.md)** - Set up user roles

## 💡 Tips for Success

✅ **Use VS Code** - Project includes optimized tasks for VS Code  
✅ **Keep terminals open** - Frontend and backend servers need to run simultaneously  
✅ **Check health endpoints** - Verify services are responding before development  
✅ **Read the logs** - Both servers provide helpful startup and error information
