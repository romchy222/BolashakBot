from datetime import datetime
from app import db

class Category(db.Model):
    """Category model for organizing FAQ items"""
    id = db.Column(db.Integer, primary_key=True)
    name_ru = db.Column(db.String(100), nullable=False)
    name_kk = db.Column(db.String(100), nullable=False)
    description_ru = db.Column(db.Text)
    description_kk = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    faqs = db.relationship('FAQ', backref='category', lazy=True)
    
    def __repr__(self):
        return f'<Category {self.name_ru}>'

class FAQ(db.Model):
    """FAQ model for storing questions and answers"""
    id = db.Column(db.Integer, primary_key=True)
    question_ru = db.Column(db.Text, nullable=False)
    question_kk = db.Column(db.Text, nullable=False)
    answer_ru = db.Column(db.Text, nullable=False)
    answer_kk = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<FAQ {self.question_ru[:50]}...>'

class UserQuery(db.Model):
    """Model for logging user queries and AI responses"""
    id = db.Column(db.Integer, primary_key=True)
    user_question = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(2), default='ru')  # 'ru' or 'kk'
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    response_time = db.Column(db.Float)  # Response time in seconds
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserQuery {self.user_question[:50]}...>'
