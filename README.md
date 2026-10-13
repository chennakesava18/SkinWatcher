# SkinWatcher

AI-Powered Early Skin Cancer Detection built with the MERN stack.

## Quick Start

1. Install dependencies:

```bash
npm run install:all
```

2. Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skinwatcher
JWT_SECRET=replace-with-a-strong-secret
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:5173
```

3. Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Run both apps:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`; the backend runs on `http://localhost:5000`.

## Admin setup

Admin accounts are provisioned from the backend command line. Normal users cannot assign themselves an admin role.

In PowerShell, set a strong local-only password and run:

```powershell
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "replace-with-a-strong-password"
$env:ADMIN_NAME = "SkinWatcher Administrator"
npm run admin:create --prefix backend
```

Add `$env:ADMIN_RESET_PASSWORD = "true"` when rotating an existing administrator password.

Then sign in at `/login`; administrators will see the Admin link and can open `/admin`.

## Note

The included prediction controller provides a deterministic demo classifier and Gemini-generated interpretation. Replace `mockPrediction` in `backend/src/controllers/predictController.js` with your trained melanoma model or external prediction API when available.
