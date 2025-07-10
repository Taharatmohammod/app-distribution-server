from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import mimetypes

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB limit

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Allowed file extensions
ALLOWED_EXTENSIONS = {'apk', 'ipa', 'aab', 'exe', 'msi', 'dmg', 'pkg'}

# Sample app data (in a real app, this would come from a database)
apps = [
    {
        "id": 1,
        "name": "Sample App 1",
        "version": "1.0.0",
        "description": "A sample application for testing",
        "downloadUrl": "/downloads/sample-app-1.apk",
        "fileSize": "15.2 MB",
        "uploadDate": "2024-01-15",
        "downloads": 1250,
        "category": "Utility"
    },
    {
        "id": 2,
        "name": "Sample App 2",
        "version": "2.1.0",
        "description": "Another sample application",
        "downloadUrl": "/downloads/sample-app-2.apk",
        "fileSize": "8.7 MB",
        "uploadDate": "2024-01-20",
        "downloads": 890,
        "category": "Entertainment"
    }
]

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size_mb(file_path):
    """Get file size in MB"""
    size_bytes = os.path.getsize(file_path)
    return round(size_bytes / (1024 * 1024), 1)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/apps')
def get_apps():
    return jsonify(apps)

@app.route('/api/apps/<int:app_id>')
def get_app(app_id):
    app = next((a for a in apps if a['id'] == app_id), None)
    if app is None:
        return jsonify({'error': 'App not found'}), 404
    return jsonify(app)

@app.route('/api/apps', methods=['POST'])
def upload_app():
    try:
        # Check if file was uploaded
        if 'appFile' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['appFile']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only app files are allowed.'}), 400
        
        # Save the file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size_mb = get_file_size_mb(file_path)
        
        # Create new app entry
        new_app = {
            'id': len(apps) + 1,
            'name': request.form.get('name', file.filename),
            'version': request.form.get('version', '1.0.0'),
            'description': request.form.get('description', ''),
            'downloadUrl': f'/downloads/{unique_filename}',
            'fileSize': f"{file_size_mb} MB",
            'uploadDate': datetime.now().strftime('%Y-%m-%d'),
            'downloads': 0,
            'category': request.form.get('category', 'Other')
        }
        
        apps.append(new_app)
        return jsonify(new_app), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/downloads/<filename>')
def download_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    
    # Update download count
    app = next((a for a in apps if a['downloadUrl'] == f'/downloads/{filename}'), None)
    if app:
        app['downloads'] += 1
    
    return send_file(file_path, as_attachment=True)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 App Distribution Server starting...")
    print("📁 Upload directory:", os.path.abspath(app.config['UPLOAD_FOLDER']))
    print(f"🌐 Server will be available at: http://localhost:{port}")
    app.run(debug=False, host='0.0.0.0', port=port) 