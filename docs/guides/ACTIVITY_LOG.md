# Activity Log Page

The Activity Log page (`/admin/activity`) provides a comprehensive view of all system activities with advanced filtering and search capabilities.

## Features

### 1. Complete Activity History

- Displays all system activities (up to 1000 most recent)
- Shows user, action, entity type, entity name, and timestamp
- Clickable rows to view detailed information

### 2. Advanced Filtering

**Filter Options:**

- **Search**: Filter by entity name or user name (client-side)
- **Entity Type**: Filter by user, role, media, collection, or document
- **Action**: Filter by created, updated, or deleted
- **Date Range**: Start date and end date filters

**Active Filters:**

- Badge showing count of active filters
- "Clear all" button to reset all filters

### 3. Pagination

- 20 activities per page
- Next/Previous navigation
- Current page indicator (e.g., "Page 1 of 5")
- Results count (e.g., "Showing 42 activities")

### 4. Activity Details Modal

Click any activity row to view detailed information:

- **User Info**: Avatar, name, and user ID
- **Action**: Color-coded badge (green=created, blue=updated, red=deleted)
- **Entity Details**: Type, ID, and name
- **Full Timestamp**: Complete date and time with day of week
- **Metadata**: JSON view of additional data (if available)
- **IP Address**: User's IP address when action was performed
- **User Agent**: Browser/client information

**Modal Features:**

- Escape key to close
- Click backdrop to close
- Close button in header

### 5. Visual Design

**Activity Icons:**

- 🟢 Created: Green plus icon
- 🔵 Updated: Blue edit icon
- 🔴 Deleted: Red trash icon

**User Avatars:**

- Shows user avatar if available
- Fallback to initials circle if no avatar

**Dark Mode:**

- Full dark mode support
- Proper contrast in all states

## Permissions

Users need the `activity` collection permission with `can_read` to access this page. By default, only Super Admins have access.

To grant access to other roles, add a permission entry:

```sql
INSERT INTO permissions (id, role_id, collection, can_create, can_read, can_update, can_delete, created_at, updated_at)
VALUES (uuid(), '<role_id>', 'activity', 0, 1, 0, 0, datetime('now'), datetime('now'));
```

## Tracked Activities

The system tracks the following actions:

- **Users**: Create, Update, Delete
- **Roles**: Create, Delete
- **Media**: Upload, Delete
- **Collections**: Create, Update, Delete (when implemented)
- **Documents**: Create, Update, Delete (when implemented)

**Note**: Login and logout events are NOT tracked to keep the activity feed focused on content changes.

## API Endpoint

The page uses the Activity API endpoint:

```
GET /api/v1/activity?limit=1000&offset=0
```

**Query Parameters:**

- `limit`: Number of activities to fetch (default: 10, max: 1000)
- `offset`: Pagination offset (default: 0)
- `user_id`: Filter by specific user (optional)
- `entity_type`: Filter by entity type (optional)
- `action`: Filter by action type (optional)

**Response Format:**

```json
{
  "activities": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "created",
      "entity_type": "user",
      "entity_id": "uuid",
      "entity_name": "john@example.com",
      "metadata": "{}",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-01-15T10:30:00Z",
      "userName": "John Doe",
      "userAvatar": "http://..."
    }
  ]
}
```

## Navigation

Access the Activity Log from:

1. **Sidebar Navigation**: Click "Activity" in the admin sidebar
2. **Direct URL**: `/admin/activity`
3. **Recent Activity Widget**: Click "View All" (when implemented)

## Usage Tips

1. **Finding Specific Activities**: Use the search box to filter by user or entity name
2. **Auditing User Actions**: Filter by a specific user to see all their activities
3. **Tracking Deletions**: Filter by "deleted" action to audit removed items
4. **Date-Based Audit**: Use date range filters for specific time periods
5. **Detailed Investigation**: Click any activity for full technical details including IP and user agent

## Component Architecture

**Main Components:**

- `ActivityPage.tsx`: Main page component with filters and pagination
- `ActivityDetailsModal.tsx`: Modal for viewing full activity details
- `activity.astro`: Astro page wrapper with AdminLayout

**Type Definitions:**

- `frontend/src/types/activity.ts`: TypeScript interfaces for ActivityLog

## Future Enhancements

Potential improvements:

- Export activities to CSV/JSON
- Real-time activity updates (WebSocket)
- Advanced search with multiple criteria
- Activity grouping by session
- Rollback functionality for reversible actions
- Email notifications for critical activities
- Activity analytics dashboard
