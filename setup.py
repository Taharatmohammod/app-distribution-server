#!/usr/bin/env python3
"""
Setup script for App Distribution Server
"""

import sys
import subprocess
import os

def check_python():
    """Check if Python is available"""
    print("🐍 Checking Python installation...")
    try:
        version = sys.version_info
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} found")
        return True
    except Exception as e:
        print(f"❌ Python not found: {e}")
        return False

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    except Exception as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    directories = ['uploads', 'templates', 'static']
    
    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"✅ Created {directory}/ directory")
        else:
            print(f"✅ {directory}/ directory already exists")

def main():
    print("🚀 App Distribution Server Setup")
    print("=" * 40)
    
    # Check Python
    if not check_python():
        print("\n❌ Python is required to run this server.")
        print("Please install Python from https://python.org")
        input("Press Enter to exit...")
        return
    
    # Create directories
    create_directories()
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Failed to install dependencies.")
        input("Press Enter to exit...")
        return
    
    print("\n✅ Setup completed successfully!")
    print("\nTo start the server, run:")
    print("python app.py")
    print("\nOr double-click run_server.bat")
    
    # Ask if user wants to start the server now
    response = input("\nWould you like to start the server now? (y/n): ")
    if response.lower() in ['y', 'yes']:
        print("\n🚀 Starting server...")
        try:
            subprocess.run([sys.executable, "app.py"])
        except KeyboardInterrupt:
            print("\n👋 Server stopped by user")
        except Exception as e:
            print(f"\n❌ Error starting server: {e}")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main() 