"""
Simple authentication system for admin panel
"""
import hashlib
import os
from functools import wraps
from flask import session, request, redirect, url_for, flash, render_template

# Default admin credentials (should be changed in production)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')

# If ADMIN_PASSWORD_HASH is not set, use default hash (for development only)
default_hash = hashlib.sha256('admin123'.encode()).hexdigest()  # Default: admin123
ADMIN_PASSWORD_HASH = os.environ.get('ADMIN_PASSWORD_HASH', default_hash)

# Warning for production environments
if os.environ.get('FLASK_ENV') == 'production' and ADMIN_PASSWORD_HASH == default_hash:
    import logging
    logging.warning('WARNING: Using default admin password in production environment!')

def hash_password(password):
    """Hash a password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return hash_password(password) == password_hash

def login_required(f):
    """Decorator to require login for admin routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect('/admin/login')
        return f(*args, **kwargs)
    return decorated_function

def check_credentials(username, password):
    """Check if provided credentials are valid"""
    return (username == ADMIN_USERNAME and 
            verify_password(password, ADMIN_PASSWORD_HASH))