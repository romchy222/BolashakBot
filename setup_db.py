"""Database migration setup script"""

import os
from flask import Flask
from flask_migrate import Migrate
from database import db

# Import models to ensure they are known to Flask-Migrate
import models

def create_app():
    """Create Flask application for migrations"""
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///qabyldaubot.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    return app

app = create_app()
migrate = Migrate(app, db)

# Функция для автоматического запуска миграций на Replit
def run_migrations():
    """Автоматически применяет миграции для Replit"""
    try:
        import flask_migrate
        import sys
        from flask.cli import with_appcontext
        from flask_migrate import init, migrate, upgrade

        # Проверяем наличие директории migrations
        if not os.path.exists('migrations'):
            print("Инициализация миграций...")
            with app.app_context():
                init()

        print("Создание миграций...")
        with app.app_context():
            migrate(message='Автоматическая миграция')

        print("Применение миграций...")
        with app.app_context():
            upgrade()

        print("Миграции успешно применены!")
        return True
    except Exception as e:
        print(f"Ошибка при выполнении миграций: {e}")
        return False

# Если запущен на Replit, автоматически запускаем миграции
if os.environ.get('REPL_ID'):
    print("Обнаружена среда Replit. Автоматическое применение миграций...")
    run_migrations()

if __name__ == '__main__':
    print("Run Flask-Migrate commands with this app context:")
    print("  flask db init     - Initialize migrations")
    print("  flask db migrate  - Generate migration")
    print("  flask db upgrade  - Apply migrations to database")
    print("\nНа платформе Replit:")
    print("  Миграции будут запущены автоматически при запуске")

    # Если выполняется напрямую и не на Replit, предлагаем запустить миграции
    if not os.environ.get('REPL_ID'):
        choice = input("\nХотите запустить миграции сейчас? (y/n): ")
        if choice.lower() == 'y':
            run_migrations()
