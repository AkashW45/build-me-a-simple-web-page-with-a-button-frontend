# Random 10 KB Text File Downloader

A simple web application that generates a random 10 KB text file and lets users download it.

## Architecture

- **Frontend**: Plain HTML, CSS, and JavaScript (no frameworks).
- **Backend**: Python Flask serving static files and API endpoints.

## Endpoints

- `GET /` - Serves the frontend.
- `GET /health` - Health check (returns `{"status": "ok"}`).
- `GET /download` - Generates and downloads a random 10 KB `.txt` file.

## Running Locally

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the server:
   ```bash
   python app.py
   ```
3. Open `http://localhost:8000` in your browser.

## Deployment

Build and run the Docker container:

```bash
docker build -t random-text-downloader .
docker run -p 8000:8000 random-text-downloader
```

## Compliance

- Listens on `0.0.0.0:8000`.
- `/health` returns HTTP 200.
- Frontend uses relative paths (e.g., `/download`).
- Static files served from same container on port 8000.
