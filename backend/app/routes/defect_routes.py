from flask import Blueprint, request, jsonify, current_app
from app.models import db, Defect, DefectMode, PDFFile
from app.validation import validate_file, is_allowed
import os
import json
import logging
from werkzeug.utils import secure_filename # Import secure_filename

# Configure logger
logger = logging.getLogger(__name__)

# Blueprint setup
bp = Blueprint('defect_routes', __name__)

# Allowed file extensions
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png'}
ALLOWED_PDF_EXTENSIONS = {'pdf'}

def success(message, data=None):
    """Helper to send success response."""
    return jsonify({'status': 'success', 'message': message, 'data': data}), 200

def error(message, code=400):
    """Helper to send error response."""
    return jsonify({'status': 'error', 'message': message}), code

def is_allowed_file(filename, allowed_extensions):
    """Helper to check if a file is allowed based on its extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def strip_or_none(s):
    """Helper to strip whitespace from a string or return None if empty."""
    return s.strip() if s is not None else None

def save_file(file, upload_folder):
    """Helper function to save uploaded files and return the filename.
    Handles filename security and ensures the upload folder exists.
    """
    if file:
        filename = secure_filename(file.filename)  # Sanitize the filename
        os.makedirs(upload_folder, exist_ok=True)  # Ensure the folder exists
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        return filename
    return None # important:  return None if no file

@bp.route('/admin/upload', methods=['POST'])
def upload_defect():
    """
    Upload a new defect.
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: defect_name
        in: formData
        type: string
        required: true
        description: Name of the defect
      - name: defect_modes
        in: formData
        type: string
        required: true
        description: JSON array string of mode names
        items:
          type: string
          required: true
      - name: descriptions
        in: formData
        type: array
        items:
          type: string
          required: true
      - name: images
        in: formData
        type: array
        items:
          type: file
        required: false
      - name: pdf
        in: formData
        type: file
        required: true
    responses:
      200:
        description: Defect upload successfully
    """
    try:
        name = strip_or_none(request.form.get('defect_name'))
        modes = json.loads(request.form.get('defect_modes', '[]'))
        descriptions = request.form.getlist('descriptions')
        images = request.files.getlist('images')
        pdf_file = request.files.get('pdf')

        # === VALIDATIONS ===
        if not name or len(name) < 3:
            return error('Defect name must be at least 3 characters long')

        if not modes or not isinstance(modes, list) or len(modes) == 0:
            return error('At least one defect mode is required')

        if len(modes) != len(descriptions):
            return error('Number of defect modes and descriptions must match')

        if not pdf_file:
            return error('A PDF file is required')
        elif not is_allowed_file(pdf_file.filename, ALLOWED_PDF_EXTENSIONS):
            return error('Only PDF files are allowed')

        for i, image in enumerate(images):
            if image and not is_allowed_file(image.filename, ALLOWED_IMAGE_EXTENSIONS):
                return error(f'Image for mode {modes[i]} must be a JPG or PNG file')

        # Ensure the number of images matches the number of modes (if provided)
        if len(images) > len(modes):
            return error('Number of images exceeds the number of defect modes')

        # === PROCESSING ===
        new_defect = Defect(name=name)
        db.session.add(new_defect)
        db.session.flush()

        for i in range(len(modes)):
            img_filename = save_file(images[i], current_app.config['UPLOAD_FOLDER_IMAGES']) if i < len(images) and images[i] else None
            new_mode = DefectMode(mode=modes[i], description=descriptions[i], image_filename=img_filename, defect=new_defect)
            db.session.add(new_mode)

        pdf_filename = save_file(pdf_file, current_app.config['UPLOAD_FOLDER_PDFS'])
        pdf = PDFFile(filename=pdf_filename, defect=new_defect)
        db.session.add(pdf)

        db.session.commit()
        return success('Defect uploaded successfully')

    except json.JSONDecodeError:
        return error('Invalid JSON format for defect_modes')
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error uploading defect: {e}")
        return error(f'Upload failed: {str(e)}', 500)



@bp.route('/defect/search', methods=['GET'])
def search_defect():
    """
    Search for defects by name, mode, or description.
    ---
    parameters:
      - name: query
        in: query
        type: string
        required: false
    responses:
      200:
        description: List of matching defects
    """
    query = request.args.get('query', '').lower()
    defects = Defect.query.join(DefectMode).filter(
        (Defect.name.ilike(f'%{query}%')) |
        (DefectMode.mode.ilike(f'%{query}%')) |
        (DefectMode.description.ilike(f'%{query}%'))
    ).distinct(Defect.id).all() # Use distinct to avoid duplicates if a defect has multiple matching modes

    result = []
    for defect in defects:
        defect_data = {
            'id': defect.id,
            'name': defect.name,
            'pdf_url': f"/pdfs/{defect.pdf.filename}" if defect.pdf else None,
            'modes': [{
                'id': mode.id,
                'mode': mode.mode,
                'description': mode.description,
                'image_url': f"/images/{mode.image_filename}" if mode.image_filename else None
            } for mode in defect.modes]
        }
        result.append(defect_data)

    return jsonify(result), 200


@bp.route('/defect/<int:defect_id>', methods=['GET'])
def get_defect(defect_id):
    """
    Get complete information for a specific defect.
    ---
    parameters:
      - name: defect_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Complete information for the requested defect
      404:
        description: Defect not found
    """
    defect = Defect.query.get_or_404(defect_id)
    defect_data = {
        'id': defect.id,
        'name': defect.name,
        'pdf_url': f"/pdfs/{defect.pdf.filename}" if defect.pdf else None,
        'modes': [{
            'id': mode.id,
            'mode': mode.mode,
            'description': mode.description,
            'image_url': f"/images/{mode.image_filename}" if mode.image_filename else None
        } for mode in defect.modes]
    }
    return jsonify(defect_data), 200


@bp.route('/defect/<int:defect_id>', methods=['DELETE'])
def delete_defect(defect_id):
    """
    Delete an entire defect, including its modes and PDF.
    ---
    parameters:
      - name: defect_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Defect deleted successfully
      404:
        description: Defect not found
    """
    try:
        defect = Defect.query.get_or_404(defect_id)

        for mode in defect.modes:
            if mode.image_filename:
                delete_file(current_app.config['UPLOAD_FOLDER_IMAGES'], mode.image_filename)
            db.session.delete(mode) # Delete the defect mode

        if defect.pdf:
            delete_file(current_app.config['UPLOAD_FOLDER_PDFS'], defect.pdf.filename)
            db.session.delete(defect.pdf)

        db.session.delete(defect)
        db.session.commit()
        return success('Defect deleted successfully')

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting defect {defect_id}: {e}")
        return error('Error deleting defect', 500)


@bp.route('/defect/mode/<int:mode_id>', methods=['DELETE'])
def delete_defect_mode(mode_id):
    """
    Delete a specific defect mode.
    ---
    parameters:
      - name: mode_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Defect mode deleted successfully
      404:
        description: Defect mode not found
    """
    try:
        mode = DefectMode.query.get_or_404(mode_id)

        if mode.image_filename:
            delete_file(current_app.config['UPLOAD_FOLDER_IMAGES'], mode.image_filename)

        db.session.delete(mode)
        db.session.commit()
        return success('Defect mode deleted successfully')

    except Exception as e:
        logger.error(f"Error deleting defect mode {mode_id}: {e}")
        return error('Error deleting defect mode', 500)



@bp.route('/defect/<int:defect_id>', methods=['PUT'])
def edit_defect(defect_id):
    """
    Edit the defect name or replace its PDF.
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: defect_id
        in: path
        type: integer
        required: true
      - name: defect_name
        in: formData
        type: string
        required: false
      - name: pdf
        in: formData
        type: file
        required: false
    responses:
      200:
        description: Defect updated successfully
      404:
        description: Defect not found
    """
    try:
        defect = Defect.query.get_or_404(defect_id)
        updated = False

        # Update defect name if provided
        name = strip_or_none(request.form.get('defect_name'))
        if name and name != defect.name:
            if len(name) < 3:
                return error('Defect name must be at least 3 characters long')
            defect.name = name
            updated = True

        # Replace PDF if provided
        pdf_file = request.files.get('pdf')
        if pdf_file:
            if not is_allowed_file(pdf_file.filename, ALLOWED_PDF_EXTENSIONS):
                return error('Only PDF files are allowed')

            # Delete old PDF if exists
            if defect.pdf and defect.pdf.filename:
                delete_file(current_app.config['UPLOAD_FOLDER_PDFS'], defect.pdf.filename)
                db.session.delete(defect.pdf)

            # Save new PDF
            pdf_filename = save_file(pdf_file, current_app.config['UPLOAD_FOLDER_PDFS'])
            new_pdf = PDFFile(filename=pdf_filename, defect=defect)
            db.session.add(new_pdf)
            updated = True

        if updated:
            db.session.commit()
            return success('Defect updated successfully')
        else:
            return success('No changes were made')

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating defect {defect_id}: {e}")
        return error(f'Database error: {str(e)}', 500)



@bp.route('/defect/mode/<int:mode_id>', methods=['PUT'])
def edit_defect_mode(mode_id):
    """
    Edit a defect mode's name, description, or image.
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: mode_id
        in: path
        type: integer
        required: true
      - name: mode
        in: formData
        type: string
        required: false
      - name: description
        in: formData
        type: string
        required: false
      - name: image
        in: formData
        type: file
        required: false
    responses:
      200:
        description: Defect mode updated successfully
      404:
        description: Defect mode not found
    """
    try:
        mode = DefectMode.query.get_or_404(mode_id)
        updated = False

        new_mode = strip_or_none(request.form.get('mode'))
        if new_mode and new_mode != mode.mode:
            if len(new_mode) < 2:
                return error('Defect mode must be at least 2 characters long')
            mode.mode = new_mode
            updated = True

        new_description = strip_or_none(request.form.get('description'))
        if new_description and new_description != mode.description:
            if len(new_description) < 5:
                return error('Description must be at least 5 characters long')
            mode.description = new_description
            updated = True

        new_image = request.files.get('image')
        if new_image:
            if not is_allowed_file(new_image.filename, ALLOWED_IMAGE_EXTENSIONS):
                return error('Image must be a JPG or PNG file')

            # Delete old image if exists
            if mode.image_filename:
                old_path = os.path.join(current_app.config['UPLOAD_FOLDER_IMAGES'], mode.image_filename)
                if os.path.exists(old_path):
                    os.remove(old_path)
            image_filename = save_file(new_image, current_app.config['UPLOAD_FOLDER_IMAGES'])
            mode.image_filename = image_filename
            updated = True

        if updated:
            db.session.commit()
            return success('Defect mode updated successfully')
        else:
            return success('No changes were made to this mode')

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating defect mode {mode_id}: {e}")
        return error(f'Database error: {str(e)}', 500)



@bp.route('/defect/<int:defect_id>', methods=['POST'])
def update_defect_details(defect_id):
    """
    Update the defect details (name, modes, PDF) in a single request.
    This route is intended to handle the "submit" button in the editing mode.
    ---
    consumes:
      - multipart/form-data
    parameters:
      - name: defect_id
        in: path
        type: integer
        required: true
      - name: defect_name
        in: formData
        type: string
        required: true
      - name: defect_modes_json
        in: formData
        type: string
        required: true
        description: JSON array of defect modes with id, mode, description, and optionally new_image
      - name: pdf
        in: formData
        type: file
        required: false
    responses:
      200:
        description: Defect details updated successfully
      400:
        description: Validation error
      404:
        description: Defect not found
      500:
        description: Internal server error
    """
    try:
        defect = Defect.query.get_or_404(defect_id)
        name = strip_or_none(request.form.get('defect_name'))
        modes_data = json.loads(request.form.get('defect_modes_json', '[]'))
        pdf_file = request.files.get('pdf')
        updated = False

        # Validate defect name
        if not name or len(name) < 3:
            return error('Defect name must be at least 3 characters long')
        if name != defect.name:
            defect.name = name
            updated = True

        # Validate and update PDF
        if pdf_file:
            if not is_allowed_file(pdf_file.filename, ALLOWED_PDF_EXTENSIONS):
                return error('Only PDF files are allowed')
            if defect.pdf and defect.pdf.filename:
                delete_file(current_app.config['UPLOAD_FOLDER_PDFS'], defect.pdf.filename)
                db.session.delete(defect.pdf)
            pdf_filename = save_file(pdf_file, current_app.config['UPLOAD_FOLDER_PDFS'])
            new_pdf = PDFFile(filename=pdf_filename, defect=defect)
            db.session.add(new_pdf)
            updated = True

        # Validate and update defect modes
        if not isinstance(modes_data, list) or len(modes_data) == 0:
            return error('At least one defect mode is required')

        existing_mode_ids = {mode.id for mode in defect.modes}
        updated_mode_ids = set()

        for mode_info in modes_data:
            mode_id = mode_info.get('id')
            mode_name = strip_or_none(mode_info.get('mode'))
            description = strip_or_none(mode_info.get('description'))
            new_image = mode_info.get('new_image') # This would likely be a filename or base64 string if sent this way

            if not mode_name or len(mode_name) < 2:
                return error(f'Defect mode name must be at least 2 characters long for mode with id {mode_id}')
            if not description or len(description) < 5:
                return error(f'Description must be at least 5 characters long for mode with id {mode_id}')

            if mode_id:
                # Existing mode, update it
                existing_mode = DefectMode.query.get(mode_id)
                if not existing_mode or existing_mode.defect_id != defect.id:
                    return error(f'Defect mode with id {mode_id} not found for this defect', 400)

                if mode_name != existing_mode.mode:
                    existing_mode.mode = mode_name
                    updated = True
                if description != existing_mode.description:
                    existing_mode.description = description
                    updated = True

                # Handle new image upload for existing mode
                if new_image and isinstance(new_image, str): # Assuming frontend sends filename of newly uploaded image
                    uploaded_file = request.files.get(new_image)
                    if uploaded_file and is_allowed_file(uploaded_file.filename, ALLOWED_IMAGE_EXTENSIONS):
                        if existing_mode.image_filename:
                            delete_file(current_app.config['UPLOAD_FOLDER_IMAGES'], existing_mode.image_filename)
                        image_filename = save_file(uploaded_file, current_app.config['UPLOAD_FOLDER_IMAGES'])
                        existing_mode.image_filename = image_filename
                        updated = True
                    elif uploaded_file:
                        return error(f'Invalid image file for mode {mode_name}')

                updated_mode_ids.add(mode_id)

            else:
                # New mode, create it
                image_file = request.files.get(f'new_image_{len(updated_mode_ids)}') # Assuming frontend sends new images with unique keys
                image_filename = None
                if image_file and is_allowed_file(image_file.filename, ALLOWED_IMAGE_EXTENSIONS):
                    image_filename = save_file(image_file, current_app.config['UPLOAD_FOLDER_IMAGES'])
                elif image_file:
                    return error(f'Invalid image file for new mode {mode_name}')

                new_mode = DefectMode(mode=mode_name, description=description, image_filename=image_filename, defect=defect)
                db.session.add(new_mode)
                updated = True

        # Check if all existing modes are still present (no accidental deletions through this update)
        if updated_mode_ids != existing_mode_ids:
            # Handle cases where modes might have been intended for deletion (frontend should use DELETE /defect/mode/:id for that)
            pass # Or you could implement logic to handle implicit deletions here if required

        if updated:
            db.session.commit()
            return success('Defect details updated successfully')
        else:
            return success('No changes were made')

    except json.JSONDecodeError:
        return error('Invalid JSON format for defect_modes_json')
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating defect {defect_id}: {e}")
        return error(f'Database error: {str(e)}', 500)
