import os
import uuid
from datetime import datetime
import logging

# Define the upload directory at the root of the backend
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "../../uploads")

# Ensure the upload directory exists
os.makedirs(UPLOADS_DIR, exist_ok=True)

logger = logging.getLogger(__name__)

def save_file(file_data: bytes, filename: str) -> str:
    """
    Save a file to the local uploads directory.

    Args:
        file_data: File content as bytes.
        filename: Original name of the file.

    Returns:
        The unique filename under which the file is saved.
    """
    try:
        file_extension = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOADS_DIR, unique_filename)

        with open(file_path, "wb") as f:
            f.write(file_data)

        logger.info(f"File saved successfully: {file_path}")
        return unique_filename
    except Exception as e:
        logger.error(f"Failed to save file locally: {e}")
        raise

def delete_file(filename: str) -> bool:
    """
    Delete a file from the local uploads directory.

    Args:
        filename: The unique name of the file to delete.

    Returns:
        True if deletion was successful, False otherwise.
    """
    try:
        file_path = os.path.join(UPLOADS_DIR, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File deleted successfully: {file_path}")
            return True
        logger.warning(f"File not found for deletion: {file_path}")
        return False
    except Exception as e:
        logger.error(f"Failed to delete file {filename}: {e}")
        return False

def get_file_path(filename: str) -> str | None:
    """
    Get the full path of a file in the uploads directory.

    Args:
        filename: The unique name of the file.

    Returns:
        The full path to the file, or None if it doesn't exist.
    """
    file_path = os.path.join(UPLOADS_DIR, filename)
    if os.path.exists(file_path):
        return file_path
    return None

def generate_prescription_filename(patient_id: str, prescription_id: str) -> str:
    """
    Generate a standardized filename for prescription PDFs.

    Args:
        patient_id: Patient ID
        prescription_id: Prescription ID

    Returns:
        Generated filename
    """
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    return f"patient_{patient_id}_prescription_{prescription_id}_{timestamp}.pdf"
