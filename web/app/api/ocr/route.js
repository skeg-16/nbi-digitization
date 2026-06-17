import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://localhost:8000';
    
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    const response = await fetch(`${ocrServiceUrl}/ocr`, {
      method: 'POST',
      body: backendFormData,
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('OCR Service error:', errText);
      return NextResponse.json({ error: 'Failed to process OCR' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error proxying OCR request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
