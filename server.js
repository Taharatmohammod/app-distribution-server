const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allow APK, IPA, and other app files
        const allowedTypes = ['.apk', '.ipa', '.aab', '.exe', '.msi', '.dmg', '.pkg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only app files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

// Sample app data (in a real app, this would come from a database)
let apps = [
    {
        id: 1,
        name: "Sample App 1",
        version: "1.0.0",
        description: "A sample application for testing",
        downloadUrl: "/downloads/sample-app-1.apk",
        fileSize: "15.2 MB",
        uploadDate: "2024-01-15",
        downloads: 1250,
        category: "Utility"
    },
    {
        id: 2,
        name: "Sample App 2",
        version: "2.1.0",
        description: "Another sample application",
        downloadUrl: "/downloads/sample-app-2.apk",
        fileSize: "8.7 MB",
        uploadDate: "2024-01-20",
        downloads: 890,
        category: "Entertainment"
    }
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/apps', (req, res) => {
    res.json(apps);
});

app.get('/api/apps/:id', (req, res) => {
    const app = apps.find(a => a.id === parseInt(req.params.id));
    if (!app) {
        return res.status(404).json({ error: 'App not found' });
    }
    res.json(app);
});

// Upload new app
app.post('/api/apps', upload.single('appFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const newApp = {
            id: apps.length + 1,
            name: req.body.name || req.file.originalname,
            version: req.body.version || '1.0.0',
            description: req.body.description || '',
            downloadUrl: `/downloads/${req.file.filename}`,
            fileSize: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadDate: new Date().toISOString().split('T')[0],
            downloads: 0,
            category: req.body.category || 'Other'
        };

        apps.push(newApp);
        res.status(201).json(newApp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download app
app.get('/downloads/:filename', (req, res) => {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // Update download count
    const app = apps.find(a => a.downloadUrl === `/downloads/${req.params.filename}`);
    if (app) {
        app.downloads++;
    }

    res.download(filePath);
});

// Serve uploaded files
app.use('/downloads', express.static(uploadsDir));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 App Distribution Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
}); 