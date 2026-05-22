# Project Setup Guide

This guide will help you set up and run the E-Learning platform on a new system.

## 1. Prerequisites

Before starting, ensure you have the following installed on your system:

### **Required Software**
*   **Node.js**: [v20.x or higher](https://nodejs.org/) (Check with `node -v`)
*   **Python**: [v3.13.x or higher](https://www.python.org/) (Check with `python --version`)
*   **NPM**: Comes with Node.js (Check with `npm -v`)

---

## 2. Project Structure

When you unzip the project, the structure should look like this:
```text
/ (Project Root)
├── backend/            # FastAPI Backend
│   ├── main.py         # Entry point
│   ├── requirements.txt # Python dependencies
│   ├── elearning.db    # Database (Current state)
│   └── uploads/        # Uploaded files (profile pics, etc.)
├── src/                # React Frontend source
├── package.json        # Frontend dependencies
├── vite.config.ts      # Frontend configuration
└── ...
```

---

## 3. Backend Setup

The backend uses **FastAPI** and **SQLite**.

1.  Open a terminal (Command Prompt or PowerShell) and navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  (Optional but Recommended) Create a Python Virtual Environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the Backend Server:
    ```bash
    python main.py
    ```
    *   (Alternatively, if you prefer using uvicorn directly: `uvicorn main:app --reload`)
    *   The backend will start at: **`http://localhost:8000`**
    *   Keep this terminal open while using the project.

---

## 4. Frontend Setup

The frontend is built with **React** and **Vite**.

1.  Open a **new** terminal and navigate to the project root directory:
    ```bash
    cd ..
    ```
2.  Install the required Node.js packages:
    ```bash
    npm install
    ```
3.  Run the Frontend Development Server:
    ```bash
    npm run dev
    ```
    *   The frontend will start at: **`http://localhost:5173`** (or as shown in the terminal).
    *   Open this URL in your web browser.

---

## 5. Important Notes

### **Database**
For production (Render + Supabase), follow **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**. Locally, the app uses SQLite unless you set `DATABASE_URL` to your Supabase Postgres URI.

### **Uploads**
With Supabase configured, course videos/PDFs and profile pictures are stored in Supabase Storage. Without Supabase env vars, files are saved under `backend/uploads/` instead.

### **Port Conflicts**
*   If the backend port (8000) is in use, the backend will fail to start.
*   If the frontend port (5173) is in use, Vite will automatically try the next available port (e.g., 5174).

### **Troubleshooting**
*   **Module not found**: Ensure you ran `pip install -r requirements.txt` for the backend and `npm install` for the frontend.
*   **API Connection Error**: Ensure the backend server is running in a separate terminal before trying to log in via the frontend.
