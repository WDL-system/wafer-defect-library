import os
import uuid
from werkzeug.utils import secure_filename

def save_file(file, upload_folder):
    """
    Saves an uploaded file securely into the given folder with a unique name.

    Args:
        file: The file object to save.
        upload_folder (str): The folder where the file should be saved.

    Returns:
        str: The filename used for saving the file.
    """
    if not file:
        return None

    # Ensure the upload folder exists
    os.makedirs(upload_folder, exist_ok=True)

    # Generate a unique filename using UUID
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(upload_folder, filename)

    # Save the file to the filesystem
    try:
        file.save(filepath)
    except Exception as e:
        print(f"Error saving file: {e}")
        return None

    return filename

def delete_file(upload_folder, filename):
    """
    Deletes the specified file from the given folder.

    Args:
        upload_folder (str): The folder containing the file.
        filename (str): The name of the file to delete.
    """
    try:
        os.remove(os.path.join(upload_folder, filename))
    except OSError as e:
        print(f"Error deleting file: {e}")
        pass  # Ignore errors if the file doesn't exist or can't be deleted
