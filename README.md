# ♻️ Kabadiwala
A modular MERN starter for the SIH project. Features 40 (AI Scrap Identification) and 42 (Price/Demand Prediction) are intentionally excluded.

## Stack
- Frontend: React + Vite + Socket.IO Client
- Backend: Node.js + Express + MongoDB/Mongoose + Socket.IO
- Auth: JWT + bcrypt
- Validation: Zod
- Offline queue: browser localStorage
- Optional integrations: OSRM, Twilio/WhatsApp, UPI/manual payment records

## Run
### Backend
cd backend
copy .env.example .env
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

Set `MONGO_URI` and `JWT_SECRET` in backend/.env.
Set `VITE_API_URL=http://localhost:8000/api` in frontend/.env.

This is a development-ready foundation, not a security guarantee or production deployment.
