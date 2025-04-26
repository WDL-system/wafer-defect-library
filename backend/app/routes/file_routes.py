from flask import Blueprint, send_from_directory, abort, current_app
import os

bp = Blueprint('file_routes', __name__)

@bp.route("/")
def index():
    return send_from_directory("static", "index.html")  # Assuming HTML is in static/

@bp.route('/images/<filename>', methods=['GET'])
def serve_image(filename):
    """
    Serve an uploaded image file. 
    ---
    parameters: 
      - name: filename
        in: path
        required: true
        description: Image filename to retrieve
        schema: 
          type: string
    responses: 
      200: 
        description: Image file
        content: 
          image/jpeg: {}
          image/png: {}
          image/jpg: {}
      404:
        description: Image not found
    """
    img_path = current_app.config['UPLOAD_FOLDER_IMAGES']
    file_path = os.path.join(img_path, filename)

    if not os.path.isfile(file_path): 
        abort(404, description="Image not found")

    return send_from_directory(current_app.config['UPLOAD_FOLDER_IMAGES'], filename)

@bp.route('/pdfs/<filename>', methods=['GET'])
def serve_pdf(filename):
    """
    Serve an uploaded PDF file. 
    ---
    parameters: 
      - name: filename
        in: path
        required: true
        description: PDF filename to retrieve
        schema: 
          type: string
    responses: 
      200: 
        description: PDF file
        content: 
          application/pdf: {}
      404: 
        description: PDF not found
    """
    pdf_path = current_app.config['UPLOAD_FOLDER_PDFS']
    file_path = os.path.join(pdf_path, filename)

    if not os.path.isfile(file_path): 
        abort(404, description="PDF not found")

    return send_from_directory(pdf_path, filename)
