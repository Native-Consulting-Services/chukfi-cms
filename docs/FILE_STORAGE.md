# File Storage Implementation Summary

## Overview

Implemented a pluggable file storage system for Chukfi CMS that starts with local file storage and is architecturally prepared for Cloudflare R2 migration.

## Changes Made

### Backend - Storage Layer

1. **Created Storage Interface** (`backend/internal/storage/storage.go`)

   - Abstract interface for file operations: Upload, Delete, GetURL, Exists
   - Config struct supporting both local and R2 configurations
   - Factory pattern for easy backend switching

2. **Implemented Local Storage** (`backend/internal/storage/local.go`)

   - Saves files to `./uploads` directory
   - Generates unique filenames using crypto/rand (32-char hex + extension)
   - Serves files via `/uploads/*` route
   - Automatic directory creation
   - Base URL configuration for public access

3. **Media Upload Handler** (`backend/internal/handlers/handlers.go`)

   - POST `/api/v1/media` endpoint
   - 10MB file size limit
   - Image-only validation (JPEG, PNG, GIF, WebP)
   - Saves metadata to media table
   - Returns media object with URL
   - Automatic cleanup on database errors

4. **Database Migration** (`backend/migrations/003_add_media_fields.*`)

   - Added `uploaded_by` column (TEXT)
   - Added `updated_at` column (DATETIME)
   - Created index on `uploaded_by`

5. **Server Configuration** (`backend/cmd/server/main.go`)
   - Initialize storage backend on startup
   - Serve static files from `/uploads` directory
   - Wire storage to handlers

### Frontend - Profile Photo Upload

1. **Fixed Endpoint** (`frontend/src/components/ProfileSettings.tsx`)
   - Changed from `/api/v1/media/upload` to `/api/v1/media`
   - Already had proper file validation (2MB max, images only)
   - Updates avatar field in user profile

## File Upload Flow

1. User selects image in ProfileSettings
2. Frontend validates file (size, type)
3. POST multipart/form-data to `/api/v1/media`
4. Backend validates file (10MB max, image types)
5. Storage backend generates unique filename
6. File saved to `./uploads/{uniqueID}.{ext}`
7. Metadata saved to media table
8. Public URL returned: `http://localhost:8080/uploads/{uniqueID}.{ext}`
9. Frontend updates user's avatar field
10. Avatar displays in UserMenu component

## Media Table Schema

```sql
CREATE TABLE media (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT,  -- User ID who uploaded the file
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Local Storage (Current)

```go
storageConfig := storage.Config{
    Type:      "local",
    LocalPath: "./uploads",
    BaseURL:   "http://localhost:8080/uploads",
}
```

### Cloudflare R2 (Future)

```go
storageConfig := storage.Config{
    Type:         "r2",
    R2AccountID:  os.Getenv("R2_ACCOUNT_ID"),
    R2AccessKey:  os.Getenv("R2_ACCESS_KEY"),
    R2SecretKey:  os.Getenv("R2_SECRET_KEY"),
    R2BucketName: os.Getenv("R2_BUCKET_NAME"),
    R2PublicURL:  os.Getenv("R2_PUBLIC_URL"),
}
```

## Testing

1. Start backend: `cd backend && go run cmd/server/main.go`
2. Start frontend: `cd frontend && npm run dev`
3. Login to admin at http://localhost:4321/login
4. Navigate to Profile page
5. Upload a profile photo
6. Verify image displays in top-right corner
7. Check `backend/uploads/` directory for uploaded file

## Cloudflare R2 Migration Path

When ready to migrate to Cloudflare R2:

1. **Create R2 Bucket**

   - Create bucket in Cloudflare dashboard
   - Enable public access or configure custom domain
   - Generate API credentials

2. **Implement R2 Storage** (`backend/internal/storage/r2.go`)

   ```go
   type R2Storage struct {
       client     *s3.Client
       bucketName string
       publicURL  string
   }

   func NewR2Storage(config Config) (*R2Storage, error) {
       // Use AWS SDK v2 with R2 endpoints
       // Cloudflare R2 is S3-compatible
   }
   ```

3. **Update Configuration**

   - Set environment variables for R2 credentials
   - Change config.Type to "r2"
   - No code changes needed in handlers!

4. **Deploy**
   - Cloudflare Workers for backend API
   - Cloudflare Pages for frontend
   - R2 bucket for file storage
   - All within Cloudflare ecosystem

## Benefits

- **Pluggable Architecture**: Swap storage backends without changing handler code
- **Local Development**: Works immediately without cloud dependencies
- **Production Ready**: Easy migration to Cloudflare R2 for scalability
- **Cost Effective**: Local storage for self-hosted, R2 for cloud
- **Secure**: File validation, size limits, authenticated uploads
- **Fast**: Unique filenames prevent collisions, efficient serving

## Security Considerations

Current implementation includes:

- File type validation (images only)
- File size limits (10MB backend, 2MB frontend for avatars)
- Authentication required for uploads
- Unique filenames prevent path traversal attacks

Future enhancements:

- Virus scanning for uploaded files
- Image optimization/resizing
- CDN integration for faster delivery
- Rate limiting on uploads
- Automatic cleanup of unused files

## Media Library (Future Enhancement)

The groundwork is laid for a full media library:

- All uploads tracked in media table
- Metadata includes uploader, timestamp, file info
- Ready for `/admin/media` page to browse/manage uploads
- Can implement search, filtering, bulk delete
- Thumbnails for image previews

## Notes

- The `original_name` field in media table is currently not set by the upload handler (needs update)
- Collections and documents tables not yet created (mentioned in migration errors)
- Migration tool updated to run all migrations sequentially
- Created helper script `cmd/createmedia/main.go` for manual media table creation
