# NBI Complaint Digitization Tool

This repository contains a two-service project to digitize NBI physical complaint registry forms via mobile capture and process them via a Python OCR microservice into a Supabase Postgres database.

## Services Overview

1.  **`/web` (Next.js Application)**: A responsive web app tailored to the NBI QMS UI for capturing photos, reviewing extracted data, and managing the official database.
2.  **`/ocr-service` (FastAPI Microservice)**: A Python service using PaddleOCR for text detection and recognition, with auto-crop and deskewing via OpenCV.

## Supabase Database Setup

1. Create a free project on [Supabase](https://supabase.com/).
2. Go to the SQL Editor and execute this table schema:
```sql
create table complaints (
  id uuid primary key default gen_random_uuid(),
  record_no text,
  date_received date,
  ccd_no text,
  nbi_ccn text,
  nature_of_case text,
  complainant text,
  subject text,
  agent_on_case text,
  age_gender text,
  contact_no text,
  status text,
  re_assigned text,
  created_at timestamp with time zone default now()
);
```
3. Copy your `Project URL` and `Service Role Key` from Project Settings -> API.

## Running Locally

To run both services locally, you will need two terminals.

### Terminal 1: OCR Microservice

```bash
cd ocr-service
python -m venv venv
.\venv\Scripts\activate  # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Runs at `http://localhost:8000`.

### Terminal 2: Next.js Web App

```bash
cd web
npm install
cp .env.example .env.local
```

Ensure `.env.local` contains your Supabase credentials and `OCR_SERVICE_URL=http://localhost:8000`.

```bash
npm run dev
```
Runs at `http://localhost:3000`.

## Deployment to Render

1. Push your code to a GitHub/GitLab repository.
2. In Render, create a new Blueprint Instance and connect your repository.
3. Render will create the `ocr-service` and `document-web`.
4. Provide the environment variables `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` during setup.
