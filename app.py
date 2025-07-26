import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure CORS
allowed_origins = [
    "https://bolashak.edu.kz",  # Основной сайт университета
    "https://www.bolashak.edu.kz",  # С www
    "http://localhost:*",  # Для локальной разработки
    "https://*.replit.app",  # Для Replit доменов
    "https://*.replit.dev",  # Для Replit dev доменов
    "https://9a3de952-6ace-4c09-9711-597039c17bc4-00-2hkh8asu6x6b3.janeway.replit.dev",  # Ваш конкретный домен
]

# Добавляем дополнительные домены из переменной окружения
extra_domains = os.environ.get("ALLOWED_DOMAINS", "")
if extra_domains:
    allowed_origins.extend([domain.strip() for domain in extra_domains.split(",")])

CORS(app, origins=allowed_origins, supports_credentials=True)

# configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///qabyldaubot.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# initialize the app with the extension
db.init_app(app)

# Import views to register routes
from views import *
# from admin import admin_bp

# Register blueprints  
# app.register_blueprint(admin_bp, url_prefix='/admin')

with app.app_context():
    # Import models to ensure tables are created
    import models
    db.create_all()
    
    # Create initial data if needed
    from models import Category, FAQ
    
    # Create default categories if they don't exist
    if not Category.query.first():
        categories = [
            Category(name_ru="Поступление", name_kk="Түсу", description_ru="Вопросы о поступлении", description_kk="Түсу туралы сұрақтар"),
            Category(name_ru="Документы", name_kk="Құжаттар", description_ru="Подача документов", description_kk="Құжаттарды тапсыру"),
            Category(name_ru="Программы", name_kk="Бағдарламалар", description_ru="Образовательные программы", description_kk="Білім беру бағдарламалары"),
            Category(name_ru="Расписание", name_kk="Кесте", description_ru="Расписание занятий", description_kk="Сабақ кестесі")
        ]
        
        for category in categories:
            db.session.add(category)
        
        db.session.commit()
        logging.info("Initial categories created")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
