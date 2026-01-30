# Media Library

The Media Library provides file upload, organization, and management capabilities for images, documents, and other files.

## Overview

- **Storage:** Local disk storage (`/public/uploads`)
- **Organization:** Hierarchical folder structure
- **Metadata:** Size, dimensions, type tracking
- **Formats:** Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX)

## File Uploads

### Uploading Files

Files are uploaded via multipart form data:

```typescript
// POST /api/media
// Content-Type: multipart/form-data

const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("folderId", "optional-folder-id");

const response = await fetch("/api/media", {
  method: "POST",
  body: formData,
});
```

### Upload Response

```json
{
  "id": "clx123...",
  "filename": "image.jpg",
  "originalName": "My Image.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "width": 1920,
  "height": 1080,
  "url": "/uploads/images/image.jpg",
  "folderId": "folder-id",
  "createdAt": "2025-01-30T10:00:00Z"
}
```

### Supported File Types

**Images:**
| Type | Extension | MIME Type |
|------|-----------|-----------|
| JPEG | .jpg, .jpeg | image/jpeg |
| PNG | .png | image/png |
| GIF | .gif | image/gif |
| WebP | .webp | image/webp |

**Documents:**
| Type | Extension | MIME Type |
|------|-----------|-----------|
| PDF | .pdf | application/pdf |
| Word | .doc | application/msword |
| Word (New) | .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document |

### File Size Limits

Default maximum file size is 10MB. This can be configured at the server/hosting level.

## File Metadata

Each uploaded file stores:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier |
| `filename` | String | Stored filename (sanitized) |
| `originalName` | String | Original upload filename |
| `mimeType` | String | File MIME type |
| `size` | Int | File size in bytes |
| `width` | Int | Image width (images only) |
| `height` | Int | Image height (images only) |
| `url` | String | Public URL path |
| `folderId` | String | Parent folder (optional) |
| `createdAt` | DateTime | Upload timestamp |
| `updatedAt` | DateTime | Last modification |

## Folder Organization

### Folder Structure

Media can be organized in hierarchical folders:

```
uploads/
├── images/
│   ├── blog/
│   │   ├── featured/
│   │   └── thumbnails/
│   └── products/
├── documents/
│   ├── contracts/
│   └── reports/
└── misc/
```

### Creating Folders

```typescript
// POST /api/media/folders
{
  "name": "Blog Images",
  "parentId": "parent-folder-id" // Optional
}
```

### Folder Response

```json
{
  "id": "clx456...",
  "name": "Blog Images",
  "parentId": "parent-id",
  "createdAt": "2025-01-30T10:00:00Z"
}
```

## Folder Navigation

### Listing Folders

```typescript
// GET /api/media/folders
// Returns all folders with hierarchy

// GET /api/media/folders?parentId=123
// Returns folders within a specific parent
```

### Listing Files in Folder

```typescript
// GET /api/media?folderId=123
// Returns files in a specific folder

// GET /api/media
// Returns files in root (no folder)
```

## File Operations

### Get File Details

```typescript
// GET /api/media/:id

{
  "id": "clx123...",
  "filename": "image.jpg",
  "originalName": "My Image.jpg",
  "mimeType": "image/jpeg",
  "size": 245678,
  "width": 1920,
  "height": 1080,
  "url": "/uploads/images/image.jpg",
  "folder": {
    "id": "folder-id",
    "name": "Blog Images"
  },
  "createdAt": "2025-01-30T10:00:00Z"
}
```

### Delete File

```typescript
// DELETE /api/media/:id

// Removes file from database and disk
```

### Move File to Folder

```typescript
// PATCH /api/media/:id
{
  "folderId": "new-folder-id"
}
```

## Folder Operations

### Get Folder Details

```typescript
// GET /api/media/folders/:id

{
  "id": "clx456...",
  "name": "Blog Images",
  "parent": { "id": "parent-id", "name": "Images" },
  "children": [...],
  "files": [...],
  "createdAt": "2025-01-30T10:00:00Z"
}
```

### Update Folder

```typescript
// PUT /api/media/folders/:id
{
  "name": "Updated Folder Name",
  "parentId": "new-parent-id"
}
```

### Delete Folder

```typescript
// DELETE /api/media/folders/:id

// Note: Folder must be empty (no files or subfolders)
```

## Storage Path

Files are stored in the public directory:

```
/public/uploads/
├── images/          # Image files
├── documents/       # Document files
└── [year]/[month]/  # Date-based organization (optional)
```

### URL Format

Files are accessible at:
```
https://yourdomain.com/uploads/images/filename.jpg
```

## Using Media in Posts

### Featured Images

```typescript
// Set featured image on a post
{
  "featuredImage": "/uploads/images/hero.jpg"
}
```

### In Rich Text Editor

Images can be inserted via the TipTap editor:

1. Click the image button in toolbar
2. Select from Media Library or upload new
3. Image is inserted with URL reference

### In SEO Metadata

```typescript
{
  "ogImage": "/uploads/images/og-share.jpg",
  "twitterImage": "/uploads/images/twitter-card.jpg"
}
```

## API Endpoints

### Media Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List all media files |
| POST | `/api/media` | Upload new file |
| GET | `/api/media/:id` | Get file details |
| PATCH | `/api/media/:id` | Update file (move folder) |
| DELETE | `/api/media/:id` | Delete file |

### Media Folders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media/folders` | List all folders |
| POST | `/api/media/folders` | Create folder |
| GET | `/api/media/folders/:id` | Get folder details |
| PUT | `/api/media/folders/:id` | Update folder |
| DELETE | `/api/media/folders/:id` | Delete folder |

## Query Parameters

### Filtering Media

```typescript
// GET /api/media?folderId=123&type=image&search=hero

// Parameters:
// - folderId: Filter by folder (use "root" for root level)
// - type: Filter by type (image, document)
// - mimeType: Filter by specific MIME type
// - search: Search in filename
// - page: Page number
// - limit: Items per page
```

## Permissions

| Permission | Description |
|------------|-------------|
| `media.view` | View media library |
| `media.upload` | Upload new files |
| `media.edit` | Edit file metadata, move files |
| `media.delete` | Delete files |
| `media.folders.create` | Create folders |
| `media.folders.edit` | Rename/move folders |
| `media.folders.delete` | Delete folders |

## Best Practices

### File Naming

- Use descriptive filenames
- Avoid special characters
- System sanitizes filenames on upload

### Organization

- Create logical folder structure
- Use date-based folders for high volume
- Separate images from documents

### Image Optimization

- Optimize images before upload
- Use WebP for better compression
- Consider max dimensions (e.g., 2000px)

### Cleanup

- Regularly review unused files
- Delete orphaned media
- Archive old content

## Troubleshooting

### Upload Fails

- Check file size limits
- Verify file type is allowed
- Check disk space on server
- Review upload directory permissions

### File Not Found

- Verify file exists in `/public/uploads`
- Check URL path is correct
- Ensure proper file permissions

### Slow Uploads

- Check network connection
- Consider chunked uploads for large files
- Review server upload limits

## Related Documentation

- [Content Management](content-management.md)
- [API Reference](../api/endpoints.md)
- [Settings](settings.md)
