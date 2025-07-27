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

if __name__ == '__main__':
    print("Run Flask-Migrate commands with this app context:")
    print("  flask db init     - Initialize migrations")
    print("  flask db migrate  - Generate migration")
    print("  flask db upgrade  - Apply migrations to database")
