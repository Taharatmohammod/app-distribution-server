#!/usr/bin/env python3
"""
WSGI entry point for PythonAnywhere deployment
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app import app

if __name__ == "__main__":
    app.run() 