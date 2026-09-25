# 🚀 Vercel Deployment & Environment Variables Guide

This guide details the exact steps to deploy the **Fresher 2026 Live Arena OS** on **Vercel** (Frontend) and **Render / Railway / VPS** (Backend with Socket.IO WebSockets).

---

## 📌 Deployment Architecture

| Component | Technology | Recommended Host | Reason |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind | **Vercel** | Lightning-fast global CDN, instant deployments |
| **Backend** | Node.js + Express + Socket.IO | **Render** or **Railway** or **VPS** | Full persistent WebSocket support (Serverless functions timeout & freeze WebSockets) |
| **Database** | MongoDB Atlas | **MongoDB Atlas Cloud** | Persistent multi-region database cluster |

---

## 🔑 Required Environment Variables

### 1. Frontend Environment Variables (Vercel)

Set these environment variables in your Vercel Project Settings under **Settings ➔ Environment Variables**:

| Variable Name | Sample / Recommended Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://fresher-backend.onrender.com` | Base URL of your deployed Backend REST API |
| `VITE_SOCKET_URL` | `https://fresher-backend.onrender.com` | Base URL of your deployed Socket.IO server |

---

### 2. Backend Environment Variables (Render / Railway / Server)

Set these environment variables on your backend hosting platform (e.g. Render Dashboard ➔ Environment Variables):

| Variable Name | Required Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` *(or assigned dynamically)* | Server HTTP Port |
| `NODE_ENV` | `production` | Production environment flag |
| `MONGO_URI` | `mongodb+srv://chaudharynax27_db_user:Nax-2903@cluster0.8f3mgjg.mongodb.net/fresher_event_db?retryWrites=true&w=majority` | MongoDB Atlas Cloud Connection String |
| `JWT_SECRET` | `fresher_super_secret_jwt_key_2026` | Secret key for Admin JWT Tokens |
| `ADMIN_USERNAME` | `Nax` | Host Admin Username |
| `ADMIN_PASSWORD` | `Nax@2907` | Host Admin Password |
| `CORS_ORIGIN` | `https://your-fresher-app.vercel.app` *(or `*`)* | Allowed Vercel Frontend Domain for CORS & Sockets |

---

## 🛠️ Step-by-Step Vercel Deployment Instructions

### Step 1: Push Code to GitHub Repository
Ensure your latest codebase is pushed to your GitHub repository (`https://github.com/Nax46/FRESHER.git`).

```bash
git add -A
git commit -m "prepare for Vercel deployment"
git push origin main
```

---

### Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New ➔ Project**.
3. Select & import your GitHub repository: `Nax46/FRESHER`.
4. Configure Project Settings:
   - **Framework Preset**: Select `Vite`.
   - **Root Directory**: `./` *(Leave default)*.
   - **Build Command**: `npm run --prefix frontend build` *(Already pre-configured in `vercel.json`)*.
   - **Output Directory**: `frontend/dist` *(Already pre-configured in `vercel.json`)*.
5. Expand **Environment Variables** section and add:
   - `VITE_API_URL` ➔ `https://your-backend-url.onrender.com`
   - `VITE_SOCKET_URL` ➔ `https://your-backend-url.onrender.com`
6. Click **Deploy**!

---

### Step 3: Deploy Backend on Render / Railway (1-Click Free Web Service)

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New ➔ Web Service**.
3. Connect your GitHub repository `Nax46/FRESHER`.
4. Configure Web Service Settings:
   - **Name**: `fresher-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.js`
5. Under **Environment Variables**, add:
   - `MONGO_URI`: `mongodb+srv://chaudharynax27_db_user:Nax-2903@cluster0.8f3mgjg.mongodb.net/fresher_event_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `fresher_super_secret_jwt_key_2026`
   - `ADMIN_USERNAME`: `Nax`
   - `ADMIN_PASSWORD`: `Nax@2907`
   - `CORS_ORIGIN`: `*`
6. Click **Create Web Service**. Render will deploy your Node.js + Socket.IO server with a live URL (e.g., `https://fresher-backend.onrender.com`).

---

### Step 4: Link Frontend & Backend

Once your backend service is live on Render:
1. Copy the backend URL (`https://fresher-backend.onrender.com`).
2. Go to **Vercel Dashboard ➔ Project Settings ➔ Environment Variables**.
3. Update `VITE_API_URL` and `VITE_SOCKET_URL` with your live backend URL.
4. Click **Redeploy** on Vercel!
