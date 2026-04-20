# 🏡 Apna Stay - Absolute Beginner's Guide

Welcome to Apna Stay! This guide is written specifically for beginners. We will go step-by-step to get this project running on your computer. 

Don't worry if you haven't used some of these technologies before—just follow the instructions exactly!

---

## 🛠️ Step 1: Install Required Software
Before we write any code, your computer needs a few tools:

1. **Download Node.js**: Go to [nodejs.org](https://nodejs.org/) and download the "LTS" (Long Term Support) version. Install it like a normal program.
2. **Download VS Code**: Go to [code.visualstudio.com](https://code.visualstudio.com/) and install it. This is where we will edit code.

---

## 🗄️ Step 2: Set Up the Database (Neon DB)
Instead of installing a complicated database on your computer, we will use a free, beginner-friendly cloud database called Neon.

1. Go to [neon.tech](https://neon.tech/) and sign up for a free account.
2. Click **"Create Project"**. Name it `apnastay`.
3. Once created, you will see a **Connection String** that looks like this: `postgresql://neondb_owner:xxxxx...`
4. **Copy this Connection String** and save it somewhere (like a Notepad). You will need it in Step 3!
5. In your Neon Dashboard, go to the **SQL Editor** tab on the left.
6. Open the `backend/database.sql` file in VS Code, copy all the text inside it, and paste it into the Neon SQL Editor. Click **Run**. This automatically creates the tables needed for the app.

---

## ⚙️ Step 3: Set up the Backend (Server)
The backend is the brain of the app. It connects to the database.

1. Open **VS Code**.
2. Click `File` > `Open Folder` and select the `apna-stay` folder.
3. Open the Terminal in VS Code by clicking `Terminal` > `New Terminal` at the top.
4. Type this command to go into the backend folder:
   ```bash
   cd backend
   ```
5. Install the required packages by typing:
   ```bash
   npm install
   ```
6. Inside the `backend` folder, create a new file named exactly `.env`
7. Copy the text below, paste it into your new `.env` file, and **replace** `your_neon_connection_string_here` with the link you saved in Step 2:
   ```env
   PORT=5000
   DATABASE_URL=your_neon_connection_string_here
   JWT_SECRET=super_secret_key_123
   CLOUDINARY_CLOUD_NAME=dftcnccer
   CLOUDINARY_API_KEY=431878442119442
   CLOUDINARY_API_SECRET=U33_BftweRzj3maqdo4BO5NP-Gc
   CORS_ORIGIN=http://localhost:3000
   ```
8. Save the file.
9. Start the server by typing:
   ```bash
   npm run dev
   ```
   *If it says "Server running on port 5000", you did it perfectly! Leave this terminal open.*

---

## 🎨 Step 4: Set up the Frontend (Website UI)
The frontend is what the user actually sees and clicks on.

1. In VS Code, open a **Second Terminal** (click the `+` button in the terminal panel so your backend keeps running).
2. Type this command to go into the frontend folder:
   ```bash
   cd frontend
   ```
3. Install the required packages by typing:
   ```bash
   npm install
   ```
4. Inside the `frontend` folder, create a new file named exactly `.env.local`
5. Paste this exactly as it is into `.env.local` and save it:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
6. Start the website by typing:
   ```bash
   npm run dev
   ```
7. Open your web browser (like Chrome) and go to **http://localhost:3000**. You should see Apna Stay running! 🎉

---

## 🗺️ A Note on Leaflet (The Maps)
You will notice the app has interactive maps. We use a library called **Leaflet** for this.
As a beginner, here is all you need to know:
- Next.js has a specific way of rendering maps. Maps cannot be loaded on the "server side".
- To prevent the app from crashing, we import maps using `next/dynamic` with `{ ssr: false }`. If you ever add a new map component, always remember this rule!
- The map markers use a package called `leaflet-defaulticon-compatibility` so the pins don't look broken.

---

## 🚀 Step 5: How to Deploy (Put it on the Internet)

When you're ready to share your app with the world:

1. **GitHub**: Push all your code to a GitHub repository.
2. **Backend on Render**:
   - Go to [render.com](https://render.com) and create a "Web Service".
   - Connect your GitHub repo.
   - Render will automatically read the `render.yaml` file in this project and set up the backend. You just need to paste your `.env` variables into Render's settings.
3. **Frontend on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click "Add New Project".
   - Connect your GitHub repo.
   - Set the **Root Directory** to `frontend`.
   - Add your Environment Variable: `NEXT_PUBLIC_API_URL = https://your-render-app-url.onrender.com/api`
   - Click Deploy!

**Congratulations! You are now a Full-Stack Developer!**
