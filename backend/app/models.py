from . import db
from datetime import datetime

class Defect(db.Model):
    """Model representing a wafer defect entry."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    modes = db.relationship('DefectMode', backref='defect', cascade='all, delete-orphan')
    pdf = db.relationship('PDFFile', backref='defect', uselist=False, cascade='all, delete-orphan')

class DefectMode(db.Model):
    """Model representing a specific mode of a wafer defect."""
    id = db.Column(db.Integer, primary_key=True)
    mode = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_filename = db.Column(db.String(255), nullable=True)  # Store filename, not path
    pdf_filename = db.Column(db.String(255), nullable=True)    # Store filename
    created_at = db.Column(DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<Defect {self.title}>'
        
class PDFFile(db.Model):
    """Model representing the PDF file associated with a defect."""
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    defect_id = db.Column(db.Integer, db.ForeignKey('defect.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
