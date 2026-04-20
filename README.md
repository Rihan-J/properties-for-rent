# Apna Stay 🏡

Apna Stay is a modern, responsive, and full-stack web application designed for listing, discovering, and managing properties (PGs, Lodges, and Homes). It features map-based discovery using Leaflet, a robust PostgreSQL backend, and an elegant Next.js frontend.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon DB recommended)
- **Maps**: Leaflet, `react-leaflet`, `react-leaflet-cluster`
- **Image Storage**: Cloudinary
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## 📂 Project Structure

```
apna-stay/
├── frontend/           # Next.js frontend application
├── backend/            # Node.js/Express backend API
└── render.yaml         # Render deployment configuration for the backend
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **PostgreSQL** (Local installation or a cloud database like Neon DB)
- A **Cloudinary** account (for image uploads)

### 2. Database (SQL) Setup
The backend requires a PostgreSQL database to store users, properties, and reviews.

1. Create a new PostgreSQL database (e.g., `apnastay`).
2. Navigate to the `backend/` directory.
3. You will find a `database.sql` file. Copy the SQL queries from `backend/database.sql` and run them in your PostgreSQL terminal (or using a UI tool like pgAdmin/DBeaver) to create the necessary tables (`users`, `properties`, `reviews`, etc.).
4. Get your connection string (e.g., `postgresql://postgres:password@localhost:5432/apnastay`).

### 3. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` directory and add the following variables:
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CORS_ORIGIN=http://localhost:3000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

### 4. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file inside the `frontend/` directory and add the backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`.*

---

## 🗺️ Leaflet Maps Integration Notes

The project relies heavily on interactive maps for property discovery.

- **Dependencies**: The map utilizes `leaflet`, `react-leaflet`, and `react-leaflet-cluster`.
- **CSS Issues**: Leaflet requires its core CSS to render tiles and markers correctly. If maps look broken or tiles are disjointed, ensure `leaflet/dist/leaflet.css` is being imported globally (handled in `src/app/globals.css`).
- **Missing Marker Icons**: By default, React-Leaflet has issues loading default marker icons in Next.js. This project uses `leaflet-defaulticon-compatibility` to automatically fix the missing icon bug.
- **SSR Warning**: Leaflet utilizes the `window` object, which means it cannot be Server-Side Rendered (SSR) in Next.js. All map components (`MapPicker`, `MapView`, `MapExplorer`) are dynamically imported using `next/dynamic` with `{ ssr: false }`.

---

## ☁️ Deployment Guide

### Deploying Backend (Render)
1. Push your code to GitHub.
2. Sign in to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file in the root directory and set up the backend.
5. Go to your Render Web Service settings and add all the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, etc.) exactly as they are in your local `.env`. Ensure `CORS_ORIGIN` is set to your future Vercel URL.

### Deploying Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import the `apna-stay` GitHub repository.
3. In the setup screen, set the **Root Directory** to `frontend`.
4. Open the **Environment Variables** section and add:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com/api`
5. Click **Deploy**. Vercel will automatically build and publish the frontend.

*(Note: The `eslint.config.mjs` is configured to bypass strict React hook linting during the Vercel build to prevent CI failures).*
