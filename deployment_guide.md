# PythonAnywhere Deployment Guide

## Step-by-Step Instructions

### Step 1: Create PythonAnywhere Account
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Click "Create a Beginner account" (FREE)
3. Fill in your details and verify your email

### Step 2: Access Your Dashboard
1. Log in to PythonAnywhere
2. You'll see your dashboard with various sections

### Step 3: Upload Your Files
1. Click on "Files" in the left sidebar
2. Navigate to your home directory
3. Click "Upload a file" and upload these files:
   - `app.py`
   - `wsgi.py`
   - `requirements.txt`
   - `README.md`

### Step 4: Create Directories
1. In the Files section, create these directories:
   - `templates`
   - `static`
   - `uploads`

### Step 5: Upload Static Files
1. Upload your CSS and JS files to the `static` directory:
   - `public/styles/main.css` → `static/styles/main.css`
   - `public/js/main.js` → `static/js/main.js`

### Step 6: Upload Template
1. Upload your HTML file:
   - `templates/index.html` → `templates/index.html`

### Step 7: Install Dependencies
1. Click on "Consoles" in the left sidebar
2. Click "Bash" to open a terminal
3. Run these commands:
   ```bash
   pip install --user Flask==2.3.3 Werkzeug==2.3.7
   ```

### Step 8: Configure Web App
1. Click on "Web" in the left sidebar
2. Click "Add a new web app"
3. Choose "Manual configuration"
4. Choose "Python 3.9" (or latest available)
5. Click "Next"

### Step 9: Set Up WSGI File
1. In the Web section, click on the WSGI configuration file
2. Replace the content with:
   ```python
   import sys
   path = '/home/yourusername'
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```
3. Replace `yourusername` with your actual PythonAnywhere username
4. Save the file

### Step 10: Configure Static Files
1. In the Web section, scroll down to "Static files"
2. Add these entries:
   - URL: `/static/` → Directory: `/home/yourusername/static/`
   - URL: `/uploads/` → Directory: `/home/yourusername/uploads/`

### Step 11: Reload Your Web App
1. Click the green "Reload" button in the Web section
2. Your site will be available at: `yourusername.pythonanywhere.com`

## Troubleshooting

### If you get errors:
1. Check the error logs in the Web section
2. Make sure all files are uploaded correctly
3. Verify the WSGI configuration
4. Check that dependencies are installed

### Common Issues:
- **Import errors**: Make sure all files are in the correct location
- **Static files not loading**: Check the static files configuration
- **Upload errors**: Make sure the uploads directory exists and has write permissions

## Your Site URL
Once deployed, your site will be available at:
`https://yourusername.pythonanywhere.com`

Replace `yourusername` with your actual PythonAnywhere username. 