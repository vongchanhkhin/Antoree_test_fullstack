# Media Upload Configuration

## Cloudinary Setup

This application uses Cloudinary for media upload functionality (images and audio files).

### Setup Steps

1. **Create a Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com) and sign up for a free account
   - After registration, you'll be taken to your Dashboard

2. **Get Your Cloud Name**
   - In your Cloudinary Dashboard, copy your **Cloud Name**
   - It should look something like: `your-app-name` or `dxxxxxxxx`

3. **Create an Upload Preset**
   - Go to **Settings** → **Upload**
   - Click **Add upload preset**
   - Set the following:
     - **Preset name**: Choose a name (e.g., `posts_media`)
     - **Signing Mode**: Select **Unsigned** (for frontend uploads)
     - **Folder**: Optional - set to `posts` to organize uploads
     - **Resource type**: Auto
     - **Access mode**: Public read
   - Save the preset

4. **Update Configuration**
   - Open `src/config/cloudinary.ts`
   - Replace `your-cloud-name` with your actual Cloud Name
   - Replace `your-upload-preset` with your actual Upload Preset name

### Example Configuration

```typescript
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'my-app-cloud',  // Your actual cloud name
  UPLOAD_PRESET: 'posts_media', // Your upload preset name
  // ... rest of config
};
```

### Supported File Types

**Images:**
- JPEG/JPG
- PNG
- GIF
- WebP
- Maximum size: 10MB

**Audio:**
- MP3
- WAV
- OGG
- MP4 Audio
- AAC
- Maximum size: 50MB

### Security Notes

- The upload preset is set to "unsigned" for frontend uploads
- Consider adding restrictions in your Cloudinary preset settings:
  - File size limits
  - Format restrictions
  - Folder organization
  - Auto-moderation for inappropriate content

### Testing

1. Make sure your configuration is correct
2. Try uploading an image and audio file in the Create Post page
3. Check your Cloudinary Media Library to see uploaded files
4. Verify the media URLs work correctly in posts

### Troubleshooting

- **Upload fails**: Check your cloud name and upload preset
- **CORS errors**: Ensure your upload preset is set to "unsigned"
- **File size errors**: Check file sizes against the configured limits
- **Format errors**: Verify the file format is in the supported list
