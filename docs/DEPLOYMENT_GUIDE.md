# Deployment Guide — Vercel + Render + MongoDB Atlas

This guide details step-by-step instructions to deploy the 🎉 **Fresher Event Game Platform** for live event production.

---

## 🗄️ Step 1: MongoDB Atlas Setup (Database)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free or M10 Dedicated for live 600-user event).
3. Under **Database Access**, create a database user:
   - Username: `fresher_admin`
   - Password: `<secure-password>`
4. Under **Network Access**, add IP Access List entry `0.0.0.0/0` (Allow access from anywhere for Render).
5. Copy connection string:
   `mongodb+srv://fresher_admin:<password>@cluster0.mongodb.net/fresher_event_db?retryWrites=true&w=majority`

---

## 🚀 Step 2: Render Deployment (Backend Server + Socket.IO)

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub Repository containing `col-fresh`.
4. Configure service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default `$PORT`)
   - `MONGO_URI`: `mongodb+srv://fresher_admin:<password>@cluster0.mongodb.net/fresher_event_db`
   - `JWT_SECRET`: `<generate-random-secret-key>`
   - `ADMIN_USERNAME`: `admin`
   - `ADMIN_PASSWORD`: `<your-secure-management-password>`
   - `CORS_ORIGIN`: `https://<your-vercel-app>.vercel.app`
6. Deploy service. Copy your public backend URL (e.g. `https://fresher-platform-backend.onrender.com`).

---

## ⚡ Step 3: Vercel Deployment (Frontend React App)

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New** → **Project**.
3. Select your GitHub repository.
4. Set Framework Preset: **Vite**.
5. Set **Root Directory**: `frontend`
6. Set Environment Variables:
   - `VITE_SOCKET_URL`: `https://fresher-platform-backend.onrender.com`
7. Click **Deploy**.

---

## 🧪 Step 4: Verification & Smoke Test

1. Visit your Vercel URL (`https://<your-app>.vercel.app`).
2. Open 3 browser windows:
   - Window 1: `/student` (Mobile viewport mode)
   - Window 2: `/management/login` (Log in with admin credentials)
   - Window 3: `/auditorium` (Fullscreen presentation screen)
3. In Management, click **OPEN GAME** on *Guess the Emoji*, then **START GAME**.
4. Submit answer on Student window. Verify candidate winner appears in Management review board within $<500\text{ms}$.
5. Click **APPROVE** and **PUBLISH TO AUDITORIUM**. Verify confetti & winner card pop up on Auditorium screen!
