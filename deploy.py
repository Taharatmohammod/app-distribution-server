#!/usr/bin/env python3
"""
Deployment script for PythonAnywhere
This script helps prepare your files for deployment
"""

import os
import shutil
import zipfile
from datetime import datetime

def create_deployment_package():
    """Create a deployment package with all necessary files"""
    
    print("🚀 Creating deployment package for PythonAnywhere...")
    
    # Create deployment directory
    deploy_dir = "deployment_package"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    
    # Files to copy
    files_to_copy = [
        'app.py',
        'wsgi.py', 
        'requirements.txt',
        'README.md'
    ]
    
    # Copy main files
    for file in files_to_copy:
        if os.path.exists(file):
            shutil.copy2(file, deploy_dir)
            print(f"✅ Copied {file}")
        else:
            print(f"❌ Missing {file}")
    
    # Create static directory
    static_dir = os.path.join(deploy_dir, "static")
    os.makedirs(static_dir, exist_ok=True)
    
    # Copy static files
    if os.path.exists("public/styles"):
        styles_dir = os.path.join(static_dir, "styles")
        os.makedirs(styles_dir, exist_ok=True)
        shutil.copy2("public/styles/main.css", styles_dir)
        print("✅ Copied CSS files")
    
    if os.path.exists("public/js"):
        js_dir = os.path.join(static_dir, "js")
        os.makedirs(js_dir, exist_ok=True)
        shutil.copy2("public/js/main.js", js_dir)
        print("✅ Copied JS files")
    
    # Copy template
    if os.path.exists("templates/index.html"):
        templates_dir = os.path.join(deploy_dir, "templates")
        os.makedirs(templates_dir, exist_ok=True)
        shutil.copy2("templates/index.html", templates_dir)
        print("✅ Copied template files")
    
    # Create uploads directory
    uploads_dir = os.path.join(deploy_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    print("✅ Created uploads directory")
    
    # Create deployment instructions
    instructions = f"""
# PythonAnywhere Deployment Instructions

## Files Ready for Upload
All necessary files are in the '{deploy_dir}' directory.

## Quick Setup Steps:
1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Create a free account
3. Upload all files from the '{deploy_dir}' folder to your home directory
4. Follow the detailed guide in deployment_guide.md

## Your Site URL
Once deployed, your site will be at: yourusername.pythonanywhere.com

## Files Included:
- app.py (main Flask application)
- wsgi.py (WSGI entry point)
- requirements.txt (Python dependencies)
- static/ (CSS and JS files)
- templates/ (HTML template)
- uploads/ (directory for uploaded files)

Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    with open(os.path.join(deploy_dir, "DEPLOYMENT_INSTRUCTIONS.txt"), "w") as f:
        f.write(instructions)
    
    print(f"\n✅ Deployment package created in '{deploy_dir}' directory")
    print("📁 Upload all files from this directory to PythonAnywhere")
    print("📖 See deployment_guide.md for detailed instructions")
    
    return deploy_dir

def create_zip_package():
    """Create a ZIP file for easy upload"""
    deploy_dir = create_deployment_package()
    
    zip_name = f"app_distribution_server_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, deploy_dir)
                zipf.write(file_path, arcname)
    
    print(f"📦 Created ZIP package: {zip_name}")
    print("📤 You can upload this ZIP file to PythonAnywhere and extract it")

if __name__ == "__main__":
    print("🚀 App Distribution Server - Deployment Helper")
    print("=" * 50)
    
    choice = input("Create deployment package? (y/n): ").lower()
    if choice in ['y', 'yes']:
        create_deployment_package()
        
        zip_choice = input("Also create ZIP package? (y/n): ").lower()
        if zip_choice in ['y', 'yes']:
            create_zip_package()
    
    print("\n📖 Next steps:")
    print("1. Go to pythonanywhere.com")
    print("2. Create a free account")
    print("3. Upload the files from deployment_package/")
    print("4. Follow the guide in deployment_guide.md") 