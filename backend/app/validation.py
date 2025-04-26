def is_allowed(filename, allowed_set):
    return validate_file(filename, allowed_set)

def validate_file(filename, allowed_set):
    """
    Validates the file extension against an allowed set.

    Args:
        filename (str): The name of the file.
        allowed_set (set): A set of allowed file extensions (e.g., {'jpg', 'pdf'}).

    Returns:
        bool: True if the file extension is valid, False otherwise.
    """
    # Check if the filename has an extension and if it's in the allowed set
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

def strip_or_none(value):
    """
    Strips the value of leading and trailing spaces, or returns None if the value is empty.

    Args:
        value (str): The string to process.

    Returns:
        str: The stripped string or None.
    """
    return value.strip() if value and isinstance(value, str) else None
