"""
Document processing utilities for handling uploaded files
"""
import os
import mimetypes
from werkzeug.utils import secure_filename
from datetime import datetime
import re

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'rtf', 'odt'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def init_upload_folder():
    """Create upload folder if it doesn't exist"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """Get file type from filename"""
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return 'unknown'

def save_uploaded_file(file):
    """Save uploaded file to disk and return file info"""
    if not file or file.filename == '':
        return None
    
    if not allowed_file(file.filename):
        raise ValueError("File type not allowed")
    
    # Create secure filename
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    name, ext = os.path.splitext(filename)
    filename = f"{timestamp}_{name}{ext}"
    
    # Ensure upload folder exists
    init_upload_folder()
    
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Get file info
    file_size = os.path.getsize(file_path)
    file_type = get_file_type(file.filename)
    
    return {
        'filename': filename,
        'original_filename': file.filename,
        'file_path': file_path,
        'file_size': file_size,
        'file_type': file_type
    }

def extract_text_from_file(file_path, file_type):
    """Extract text content from uploaded file"""
    try:
        if file_type == 'txt':
            return extract_text_from_txt(file_path)
        elif file_type == 'pdf':
            return extract_text_from_pdf(file_path)
        elif file_type in ['doc', 'docx']:
            return extract_text_from_docx(file_path)
        else:
            return "Unsupported file type for text extraction"
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def extract_text_from_txt(file_path):
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        # Try different encodings
        for encoding in ['cp1251', 'latin1', 'ascii']:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        return "Unable to decode file content"

def extract_text_from_pdf(file_path):
    """Extract text from PDF file - placeholder implementation"""
    # This would require PyPDF2 or similar library
    # For now, return a placeholder
    return "PDF text extraction requires additional libraries (PyPDF2). Placeholder content extracted."

def extract_text_from_docx(file_path):
    """Extract text from DOCX file - placeholder implementation"""
    # This would require python-docx library
    # For now, return a placeholder
    return "DOCX text extraction requires additional libraries (python-docx). Placeholder content extracted."

def clean_extracted_text(text):
    """Clean and normalize extracted text"""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s\-.,!?:;()"\']', ' ', text)
    # Normalize line breaks
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    return text.strip()

def delete_file(file_path):
    """Delete file from disk"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
    return False