# App Distribution Server

A modern, beautiful web application for distributing and managing app updates. This server allows you to upload, host, and distribute your applications with a clean, responsive interface.

## Features

- 🚀 **Modern UI**: Beautiful, responsive design with smooth animations
- 📱 **App Management**: Upload, organize, and distribute your apps
- 🔍 **Search & Filter**: Find apps quickly with real-time search
- 📊 **Download Tracking**: Monitor download statistics
- 🎯 **Multiple Platforms**: Support for APK, IPA, AAB, EXE, MSI, DMG, PKG files
- 🔒 **Secure**: File validation and security measures
- 📱 **Mobile Friendly**: Responsive design works on all devices

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### For App Developers

1. **Upload Your App:**
   - Click the "Upload" tab
   - Fill in app details (name, version, description, category)
   - Select your app file (APK, IPA, etc.)
   - Click "Upload App"

2. **Manage Your Apps:**
   - View all uploaded apps in the "Apps" tab
   - Search and filter apps
   - Click on any app to see detailed information
   - Download apps directly

### For Users

1. **Browse Apps:**
   - View all available apps in the main interface
   - Use the search bar to find specific apps
   - Click on app cards to see more details

2. **Download Apps:**
   - Click the "Download" button on any app
   - Files will download directly to your device

## API Endpoints

### GET `/api/apps`
Returns a list of all available apps.

### GET `/api/apps/:id`
Returns detailed information about a specific app.

### POST `/api/apps`
Upload a new app. Requires multipart form data with:
- `name`: App name
- `version`: App version
- `description`: App description (optional)
- `category`: App category
- `appFile`: The app file (APK, IPA, etc.)

### GET `/downloads/:filename`
Download a specific app file.

## File Types Supported

- **Android**: `.apk`, `.aab`
- **iOS**: `.ipa`
- **Windows**: `.exe`, `.msi`
- **macOS**: `.dmg`, `.pkg`

## Project Structure

```
app-distribution-server/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Static files
│   ├── index.html         # Main HTML file
│   ├── styles/
│   │   └── main.css       # Main stylesheet
│   └── js/
│       └── main.js        # Frontend JavaScript
├── uploads/               # Uploaded app files (created automatically)
└── README.md              # This file
```

## Development

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with auto-reload
- `npm run build`: Build CSS files (if using SASS)

### Customization

#### Adding New File Types
Edit the `fileFilter` function in `server.js`:

```javascript
const allowedTypes = ['.apk', '.ipa', '.aab', '.exe', '.msi', '.dmg', '.pkg', '.your-extension'];
```

#### Changing the Port
Set the `PORT` environment variable or modify the default in `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

#### Database Integration
Currently, the app uses in-memory storage. For production, consider integrating with:
- MongoDB
- PostgreSQL
- SQLite

## Security Features

- **File Validation**: Only allowed file types can be uploaded
- **File Size Limits**: 500MB maximum file size
- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Input Sanitization**: XSS protection

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port in `server.js` or set `PORT` environment variable
   - Kill the process using the port: `npx kill-port 3000`

2. **File upload fails:**
   - Check file size (max 500MB)
   - Ensure file type is supported
   - Check uploads directory permissions

3. **Apps not loading:**
   - Check browser console for errors
   - Verify server is running
   - Check network connectivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own app distribution needs!

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the repository. 