# 🚀 Deployment Guide (Free Tier)

This guide will help you deploy your **Edge-Tech Platform** (React + Node.js + MySQL) for free using:
- **Client (Frontend):** Vercel
- **Server (Backend):** Render
- **Database (MySQL):** Aiven (Free Tier)

---

## 🟢 Step 1: Database Deployment (Aiven)

Since MySQL hosting is rarely free, we will use **Aiven** which offers a free MySQL plan.

1.  **Sign up** at [Aiven.io](https://aiven.io/).
2.  Click **Create Service**.
3.  Select **MySQL**.
4.  Choose **Cloud Provider**: Google Cloud or AWS (Region: Choose one close to you, or `Singaore/India` if available, otherwise `europe-west`).
5.  **Select Service Plan**: Choose the **Free** plan.
6.  Click **Create Service**.
7.  Wait for the service to start (Status: *Running*).
8.  Copy the **Service URI** (It looks like `mysql://avnadmin:password@host:port/defaultdb`).
    *   *Note: You will need this connection string later.*

### 🛠️ Import Your Database Schema
To make your new cloud database work, you need to run your SQL tables on it.
1.  Connect to your Aiven database using a tool like **DBeaver** or **MySQL Workbench**.
2.  Or use the "SQL" tab in the Aiven Console if available.
3.  Run the SQL commands from your local project to create tables:
    *   `users`, `courses`, `enrollments`, `lessons`, etc.
    *   *Tip: You might need to export your local database structure and import it there.*

---

## 🟢 Step 2: Backend Deployment (Render)

We will deploy the Node.js Server to Render.

1.  **Push your code to GitHub** (if not already done).
    *   Make sure you have a `server` folder in your repo.
2.  **Sign up** at [Render.com](https://render.com/).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Name**: `edtech-server`
    *   **Root Directory**: `server` (Important! Since your backend is in the server folder).
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
    *   **Instance Type**: Free
6.  **Environment Variables** (Click "Advanced"):
    Add the following keys and values from your Aiven database:
    *   `DB_HOST`: (Host from Aiven, e.g., `mysql-service.aivencloud.com`)
    *   `DB_USER`: `avnadmin`
    *   `DB_PASSWORD`: (Your Aiven password)
    *   `DB_NAME`: `defaultdb` (or whatever your DB name is)
    *   `DB_PORT`: (Port from Aiven, usually something like `21695`)
    *   `CLIENT_URL`: `https://YOUR-VERCEL-APP-NAME.vercel.app` (You will update this later after deploying frontend).
    *   `JWT_SECRET`: (Create a random secret key)
7.  Click **Create Web Service**.
8.  Wait for deployment to finish. **Copy the backend URL** (e.g., `https://edtech-server.onrender.com`).

---

## 🟢 Step 3: Frontend Deployment (Vercel)

Now deploy the React Frontend.

1.  **Sign up** at [Vercel.com](https://vercel.com/).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Project Settings**:
    *   **Framework Preset**: Create React App
    *   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    *   Name: `REACT_APP_API_URL`
    *   Value: (Paste your Render Backend URL here, e.g., `https://edtech-server.onrender.com`)
        *   *Note: Do NOT add `/api` at the end if your code appends it automatically (Your code DOES append `/api`, so just the domain).*
6.  Click **Deploy**.

---

## 🟢 Step 4: Final Configuration

1.  Once Vercel finishes, you will get a **Live URL** (e.g., `https://edtech-platform.vercel.app`).
2.  Go back to **Render Dashboard** -> **Environment Variables**.
3.  Update (or Add) `CLIENT_URL` with your new Vercel URL.
    *   *This is required for CORS to allow the frontend to talk to the backend.*
4.  **Redeploy** the backend (Manual Deploy -> Deploy latest commit) to apply the change.

---

## ✅ Done!
Your app should now be live!

**Troubleshooting:**
*   **Database Error?** Check if Aiven requires SSL. In `server/config/database.js`, you might need to add `{ ssl: { rejectUnauthorized: false } }` to the connection config if connecting to a cloud DB that enforces SSL.
*   **CORS Error?** Ensure `CLIENT_URL` in Render matches your Vercel URL exactly (no trailing slash).
