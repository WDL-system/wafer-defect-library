import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "defaultsecretkey")
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///defects.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER_IMAGES = os.path.join(BASE_DIR, 'static', 'images')
    UPLOAD_FOLDER_PDFS = os.path.join(BASE_DIR, 'static', 'pdfs')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024