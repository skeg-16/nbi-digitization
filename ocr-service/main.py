from fastapi import FastAPI, File, UploadFile
import uvicorn
from preprocessing import process_image
import pytesseract
import cv2

app = FastAPI(title="OCR Microservice")

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    processed_img = process_image(image_bytes)
    
    # Convert image to grayscale for better Tesseract performance
    gray_img = cv2.cvtColor(processed_img, cv2.COLOR_BGR2GRAY)
    
    # Run PyTesseract and request dictionary output containing bounding boxes
    d = pytesseract.image_to_data(gray_img, output_type=pytesseract.Output.DICT)
    
    extracted_data = []
    n_boxes = len(d['text'])
    
    for i in range(n_boxes):
        text = d['text'][i].strip()
        conf = int(d['conf'][i])
        
        # Only include boxes that have actual text and a positive confidence
        if conf > 0 and text:
            extracted_data.append({
                "text": text,
                # Tesseract gives confidence as 0-100, normalize to 0.0-1.0
                "confidence": float(conf) / 100.0,
                "bounding_box": [
                    float(d['left'][i]),
                    float(d['top'][i]),
                    float(d['width'][i]),
                    float(d['height'][i])
                ]
            })
            
    return {"data": extracted_data}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
