from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime
import mimetypes
from supabase import create_client, Client
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB limit

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Allowed file extensions
ALLOWED_EXTENSIONS = {'apk', 'ipa', 'aab', 'exe', 'msi', 'dmg', 'pkg'}

# Supabase setup
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://wgogoihxbasjhviqqfvk.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnb2dvaWh4YmFzamh2aXFxZnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxOTA2MDAsImV4cCI6MjA2Nzc2NjYwMH0._oAZ_22HKlhtLwZBei-cBpY3d9Sm_Lyc9E58jSF4Hwc")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size_mb(file_path):
    """Get file size in MB"""
    size_bytes = os.path.getsize(file_path)
    return round(size_bytes / (1024 * 1024), 1)

@app.route('/')
def index():
    try:
        response = supabase.table('apps').select('*').execute()
        apps = response.data
        # Get download counts for each app
        download_counts = {}
        for app in apps:
            try:
                count_resp = supabase.table('downloads').select('id').eq('app_id', app['id']).execute()
                download_counts[app['id']] = len(count_resp.data) if hasattr(count_resp, 'data') else 0
            except Exception as e:
                logging.error(f"Error fetching download count for app {app['id']}: {e}")
                download_counts[app['id']] = 0
        return render_template('index.html', apps=apps, download_counts=download_counts)
    except Exception as e:
        logging.error(f"Error loading main page: {e}")
        return render_template('index.html', apps=[], download_counts={}, error_message="An error occurred while loading apps. Please try again later.")

@app.route('/api/apps')
def get_apps():
    try:
        response = supabase.table('apps').select('*').execute()
        return jsonify(response.data)
    except Exception as e:
        logging.error(f"Error fetching apps: {e}")
        return jsonify({'error': 'Failed to fetch apps'}), 500

@app.route('/api/apps/<int:app_id>')
def get_app(app_id):
    try:
        response = supabase.table('apps').select('*').eq('id', app_id).execute()
        if not response.data:
            return jsonify({'error': 'App not found'}), 404
        return jsonify(response.data[0])
    except Exception as e:
        logging.error(f"Error fetching app {app_id}: {e}")
        return jsonify({'error': 'Failed to fetch app'}), 500

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
        filename = secure_filename(file.filename or "")
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Get file size
        file_size_mb = get_file_size_mb(file_path)
        
        # Create new app entry in Supabase
        new_app = {
            'name': request.form.get('name', file.filename),
            'version': request.form.get('version', '1.0.0'),
            'description': request.form.get('description', ''),
            'downloadUrl': f'/downloads/{unique_filename}',
            'fileSize': f"{file_size_mb} MB",
            'uploadDate': datetime.now().strftime('%Y-%m-%d'),
            'downloads': 0,
            'category': request.form.get('category', 'Other')
        }
        insert_response = supabase.table('apps').insert(new_app).execute()
        return jsonify(insert_response.data[0]), 201
        
    except Exception as e:
        logging.error(f"Error uploading app: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download/<int:app_id>')
def download_and_log(app_id):
    try:
        # Get app info
        response = supabase.table('apps').select('*').eq('id', app_id).execute()
        if not response.data:
            return 'App not found', 404
        app = response.data[0]
        # Log the download
        try:
            supabase.table('downloads').insert({'app_id': app_id}).execute()
        except Exception as e:
            logging.error(f"Error logging download for app {app_id}: {e}")
        # Redirect to the Supabase Storage URL
        return redirect(app['downloadUrl'])
    except Exception as e:
        logging.error(f"Error handling download for app {app_id}: {e}")
        return 'An error occurred while processing your download. Please try again later.', 500

@app.route('/downloads/<filename>')
def download_file(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Update download count in Supabase
        response = supabase.table('apps').select('*').eq('downloadUrl', f'/downloads/{filename}').execute()
        if response.data:
            app_id = response.data[0]['id']
            current_downloads = response.data[0].get('downloads', 0)
            supabase.table('apps').update({'downloads': current_downloads + 1}).eq('id', app_id).execute()
        
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logging.error(f"Error serving file {filename}: {e}")
        return jsonify({'error': 'Failed to serve file'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        return send_file(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    except Exception as e:
        logging.error(f"Error serving uploaded file {filename}: {e}")
        return jsonify({'error': 'Failed to serve uploaded file'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("🚀 App Distribution Server starting...")
    print("📁 Upload directory:", os.path.abspath(app.config['UPLOAD_FOLDER']))
    print(f"🌐 Server will be available at: http://localhost:{port}")
    app.run(debug=False, host='0.0.0.0', port=port) 