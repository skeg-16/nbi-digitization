from fastapi import FastAPI, File, UploadFile
from paddleocr import PaddleOCR
import uvicorn
from preprocessing import process_image

app = FastAPI(title="OCR Microservice")

ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=True)

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    processed_img = process_image(image_bytes)
    
    result = ocr.ocr(processed_img, cls=True)
    
    extracted_data = []
    
    if result and result[0]:
        for line in result[0]:
            box = line[0]
            text = line[1][0]
            confidence = float(line[1][1])
            
            xs = [point[0] for point in box]
            ys = [point[1] for point in box]
            x_min = min(xs)
            y_min = min(ys)
            width = max(xs) - x_min
            height = max(ys) - y_min
            
            extracted_data.append({
                "text": text,
                "confidence": confidence,
                "bounding_box": [float(x_min), float(y_min), float(width), float(height)]
            })
            
    return {"data": extracted_data}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
