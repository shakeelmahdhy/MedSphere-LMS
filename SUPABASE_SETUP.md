# Supabase setup for MedSphere LMS

This guide connects your hosted app (Render backend + Vercel frontend) to **Supabase Postgres** and **Supabase Storage**.

## 1. Database (Postgres)

1. Open your Supabase project → **Project Settings** → **Database**.
2. Copy the **Connection string** (URI), **Session** pooler mode (port `5432`).
3. In **Render** → your backend service → **Environment**, set:
   - `DATABASE_URL` = that connection string
   - `SECRET_KEY` = a long random string
4. Redeploy the backend. On startup, SQLAlchemy runs `create_all` and creates tables in Supabase.

### Fresh data

If you need demo users/courses on the new database:

```bash
cd backend
# Ensure DATABASE_URL points at Supabase in .env
python seed_db.py
```

### Migrating existing SQLite data

If you still have `backend/elearning.db` locally with data you need:

1. Set `DATABASE_URL` to Supabase in `.env`.
2. Deploy once so tables exist.
3. Use a DB tool (TablePlus, DBeaver) or a one-off script to export SQLite and import into Postgres, **or** re-seed and re-upload course files.

Old course content URLs pointing at `localhost:8000` will not work until you re-upload files to Supabase Storage.

---

## 2. Storage buckets

1. Supabase dashboard → **Storage** → **New bucket**:
   - Name: `course-content` → **Public bucket**: ON
   - Name: `profile-pictures` → **Public bucket**: ON

2. **Project Settings** → **API** → copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

3. Add to **Render** environment:

| Variable | Value |
|----------|--------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key |
| `SUPABASE_COURSE_BUCKET` | `course-content` (optional if using default) |
| `SUPABASE_PROFILE_BUCKET` | `profile-pictures` (optional) |
| `PUBLIC_API_URL` | `https://your-backend.onrender.com` |

Uploads from `/api/upload` and `/api/users/profile-picture` go to Supabase and return public URLs like:

`https://xxxx.supabase.co/storage/v1/object/public/course-content/...`

---

## 3. Frontend (Vercel)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

Redeploy Vercel after changing env vars.

---

## 4. Local development

Copy `.env.example` to `backend/.env` and fill in Supabase values. For frontend, create `.env` in the project root:

```
VITE_API_URL=http://localhost:8000/api
```

Install backend deps:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Without Supabase env vars, the app falls back to SQLite (`sqlite:///./test.db`) and local `backend/uploads/` files.

---

## 5. Checklist

- [ ] `DATABASE_URL` set on Render (Postgres URI, not SQLite)
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set on Render
- [ ] Public buckets `course-content` and `profile-pictures` created
- [ ] `VITE_API_URL` set on Vercel
- [ ] Backend redeployed, frontend redeployed
- [ ] Test: register/login, upload course video/PDF, upload profile picture
