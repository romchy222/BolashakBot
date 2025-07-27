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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)