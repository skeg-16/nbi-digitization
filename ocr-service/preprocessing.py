import cv2
import numpy as np

def process_image(image_bytes: bytes) -> np.ndarray:
    """
    Reads an image from bytes.
    We bypass the auto-crop (perspective transform) because the complex
    backgrounds and tables in the document cause it to incorrectly crop,
    cutting off essential fields. PaddleOCR handles full images well.
    Returns a numpy array suitable for PaddleOCR.
    """
    # Load image using OpenCV
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    # We return the decoded image directly instead of aggressive cropping.
    # PaddleOCR's internal DBNet text detection is robust enough for uncropped images.
    return img
