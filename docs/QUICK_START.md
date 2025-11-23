# 🎯 Quick Start Tutorial

Create your first collection and content in **10 minutes**. This tutorial assumes you have [completed installation](INSTALLATION.md).

## Step 1: Access the Admin Dashboard

1. **Start your development servers** (if not already running):

   ```bash
   # VS Code: Ctrl+Shift+P → "Start Development Environment"
   # OR manually start both frontend and backend
   ```

2. **Open the admin dashboard**: http://localhost:4321/admin

3. **Login with default credentials**:
   - **Email**: `admin@chukfi.com`
   - **Password**: `admin123`

## Step 2: Create Your First Collection

Collections define the structure of your content (like "Posts", "Products", or "Pages").

1. **Navigate to Collections** in the admin sidebar

2. **Click "Create Collection"**

3. **Fill in collection details**:

   ```
   Name: Blog Posts
   Slug: blog-posts
   Description: Articles and blog content
   ```

4. **Add fields** to define your content structure:

   **Field 1 - Title**:

   - Type: Text
   - Label: Title
   - Required: Yes

   **Field 2 - Content**:

   - Type: Textarea
   - Label: Content
   - Required: Yes

   **Field 3 - Author**:

   - Type: Text
   - Label: Author
   - Required: No

   **Field 4 - Published**:

   - Type: Boolean
   - Label: Published
   - Default: false

5. **Save the collection**

## Step 3: Create Your First Document

Documents are individual pieces of content within a collection.

1. **Click into your "Blog Posts" collection**

2. **Click "Create Document"**

3. **Fill in the content**:

   ```
   Title: Welcome to Chukfi CMS
   Content: This is my first blog post using Chukfi CMS.
            The interface is clean and easy to use!
   Author: Your Name
   Published: ✓ (checked)
   ```

4. **Save the document**

## Step 4: Explore the API

Your content is automatically available via REST API.

1. **View all blog posts**:

   ```bash
   curl http://localhost:8080/api/v1/collections/blog-posts/documents
   ```

2. **View your specific post**:

   ```bash
   curl http://localhost:8080/api/v1/collections/blog-posts/documents/1
   ```

3. **Check API health**:
   ```bash
   curl http://localhost:8080/health
   ```

## Step 5: Customize the Admin Dashboard

1. **Update your admin user**:

   - Go to Users in the admin panel
   - Click on your admin user
   - Update email, name, and password
   - Save changes

2. **Create additional users**:
   - Click "Create User"
   - Assign appropriate roles (Admin, Editor, Viewer)
   - Set permissions for different collections

## Step 6: Add Media Files

1. **Navigate to Media Library**

2. **Upload files**:

   - Drag and drop images, documents, or other files
   - Files are automatically organized and accessible

3. **Use media in content**:
   - Reference uploaded files in your documents
   - Media files get automatic URLs for frontend use

## 🎯 What You've Accomplished

✅ **Created a collection** with custom fields  
✅ **Added your first content** document  
✅ **Explored the REST API** endpoints  
✅ **Configured users and permissions**  
✅ **Uploaded media files**

## 🚀 Next Steps

### Expand Your Content Model

- **Add more field types**: Select dropdowns, number fields, date fields
- **Create relationships**: Link documents between collections
- **Add validation**: Set required fields, character limits, formats

### Build Your Frontend

- **Fetch content** via the REST API from your Astro/React frontend
- **Create dynamic pages** that render your CMS content
- **Add search and filtering** for better user experience

### Advanced Features

- **Role-based permissions**: Fine-tune who can access what
- **Webhooks**: Trigger actions when content changes
- **Media transformations**: Automatic image resizing and optimization

## 📚 Learn More

- 🏗️ **[Collections Guide](guides/COLLECTIONS.md)** - Advanced collection configuration
- 👥 **[Users & Permissions](guides/USERS_PERMISSIONS.md)** - Detailed permission system
- 🔌 **[REST API Reference](api/REST_API.md)** - Complete API documentation
- 📁 **[Media Management](guides/MEDIA.md)** - File upload best practices

## 💡 Pro Tips

✅ **Plan your collections first** - Think about your content structure before building  
✅ **Use descriptive field names** - Makes API responses more intuitive  
✅ **Test API endpoints** - Use curl or Postman to explore your data  
✅ **Organize media files** - Use descriptive filenames and folders  
✅ **Set up proper permissions** - Don't give everyone admin access

## 🆘 Need Help?

- 📖 **[Full Documentation](README.md)** - Complete guides and references
- 💬 **[GitHub Discussions](../../../discussions)** - Community Q&A
- 🐛 **[Issues](../../../issues)** - Bug reports and feature requests
