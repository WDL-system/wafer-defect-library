from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flasgger import Swagger
import os
from .config import Config
from werkzeug.utils import secure_filename # Import secure_filename

# Initialize db and migrate globally
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Load configuration from Config class
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Swagger for API documentation
    Swagger(app)

    # Ensure upload folders exist
    try:
        os.makedirs(app.config['UPLOAD_FOLDER_IMAGES'], exist_ok=True)
        os.makedirs(app.config['UPLOAD_FOLDER_PDFS'], exist_ok=True)
    except OSError as e:
        app.logger.error(f"Error creating upload folders: {e}")

    # Register blueprints
    from app.routes.defect_routes import bp as defect_bp
    from app.routes.file_routes import bp as file_bp # Import file_bp
    app.register_blueprint(defect_bp)
    app.register_blueprint(file_bp) # Register file_bp

    _ensure_upload_folders(app)

    # Home route - Render index.html dynamically
    @app.route('/')
    def index():
        return render_template('index.html')

    return app

# Helper Functions
def _ensure_upload_folders(app):
    """Ensures that the upload folders exist."""
    try:
        os.makedirs(app.config['UPLOAD_FOLDER_IMAGES'], exist_ok=True)
        os.makedirs(app.config['UPLOAD_FOLDER_PDFS'], exist_ok=True)
    except OSError as e:
        app.logger.error(f"Error creating upload folders: {e}")
        # Consider raising the exception again or handling it more robustly

# Add these utility functions to app/__init__.py
def save_file(file, upload_folder):
    """Helper function to save uploaded files and return the filename.
    Handles filename security and ensures the upload folder exists.
    """
    if file:
        filename = secure_filename(file.filename)  # Sanitize the filename
        os.makedirs(upload_folder, exist_ok=True)  # Ensure the folder exists
        filepath = os.path.join(upload_folder, filename)
        try: 
            file.save(filepath)
            return filename
        except Exception as e: 
            print(f"Error saving file: {e}")
            return None
    return None

def delete_file(upload_folder, filename):
    """Helper function to delete a file from the filesystem."""
    if filename:
        filepath = os.path.join(upload_folder, filename)
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                print(f"Error deleting file: {e}") # Log error, but don't crash
                return False # Indicate failure
            return True #Indicate Success
        return False # File does not exist
    return False # No filename provided