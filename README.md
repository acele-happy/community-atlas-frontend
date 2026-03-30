# 🗺️ CommunityAtlas — Frontend

> A community-driven digital map for discovering local services in Rwandan communities.  
> Built with **React** + **Vite** + **Axios**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Features & Pages](#features--pages)
- [Connecting to the Backend](#connecting-to-the-backend)
- [Test Accounts](#test-accounts)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

CommunityAtlas is a web platform that helps residents of Rwanda's Gasabo district find local services — health centers, schools, businesses, and community organizations. Service providers can register and list their services, and community administrators can review and moderate submissions.

This repository contains the **React frontend only**. It requires the [CommunityAtlas Backend](../communityatlas-backend) to be running before you can log in, submit services, or see live data.

---

## Prerequisites

Before you begin, make sure the following are installed on your computer:

| Tool | Minimum Version | How to check | Download |
|------|----------------|--------------|----------|
| Node.js | v18 or higher | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | v8 or higher | `npm --version` | Comes with Node.js |
| Git | Any | `git --version` | [git-scm.com](https://git-scm.com) |

> ⚠️ **Make sure the backend server is also running** on `http://localhost:5000` before using the app. See the [backend README](../communityatlas-backend/README.md) for setup instructions.

---

## Installation

Follow these steps **exactly** in order:

### Step 1 — Clone or download the project

If you have the project as a zip file, extract it. If you are cloning from GitHub:

```bash
git clone https://github.com/your-username/communityatlas.git
cd communityatlas
```

### Step 2 — Navigate into the frontend folder

```bash
cd communityatlas-frontend
```

### Step 3 — Install dependencies

This installs React, Axios, Vite, and all other required packages:

```bash
npm install
```

You should see a `node_modules/` folder appear. This may take 1–2 minutes.

> ❌ If you see errors, make sure your Node.js version is 18 or higher (`node --version`).

---

## Project Structure

```
communityatlas-frontend/
├── src/
│   └── App.jsx          # The entire React application (single-file component)
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

---

## Environment Setup

The frontend connects to the backend API. By default it points to `http://localhost:5000/api`.

If you need to change the backend URL (for example when deploying), open `src/App.jsx` and update this line near the top of the file:

```js
// src/App.jsx — line ~5
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",  // ← change this if your backend is on a different URL
  headers: { "Content-Type": "application/json" },
});
```

> No `.env` file is needed for basic local development.

---

## Running the App

### Step 1 — Make sure the backend is running first

Open a separate terminal window and start the backend server (see backend README). You should see:

```
🚀 Server running on http://localhost:5000
✅ MongoDB connected: ...
```

### Step 2 — Start the frontend development server

In your frontend terminal:

```bash
npm run dev
```

You should see output like:

```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 3 — Open the app in your browser

Go to: **http://localhost:3000**

The app should load and display the CommunityAtlas home page.

---

## Features & Pages

| Page | URL path | Who can use it |
|------|----------|----------------|
| **Home / Explore** | `/` | Everyone — browse and search approved services |
| **Map View** | Nav → Map | Everyone — see services pinned on a visual map |
| **Add Service** | Nav → Add Service | Logged-in Service Providers only |
| **Admin Dashboard** | Nav → Admin | Logged-in Admins only |
| **Sign In / Register** | Modal via Nav | Everyone |

### How authentication works

- When you log in, a **JWT token** is saved in your browser's `localStorage` under the key `ca_token`.
- On every page reload, the app automatically reads this token and restores your session by calling `GET /api/auth/me`.
- When you sign out, the token is deleted from `localStorage`.
- You do **not** need to log in to browse approved services — the explore and map pages are fully public.

---

## Connecting to the Backend

The frontend uses a single **Axios instance** configured at the top of `src/App.jsx`. It has two interceptors:

**Request interceptor** — automatically attaches your JWT token to every API call:
```js
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("ca_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Response interceptor** — handles errors cleanly so you don't need try/catch everywhere:
```js
axiosInstance.interceptors.response.use(
  res => res.data,
  err => err.response?.data || { success: false, message: "Cannot connect to server" }
);
```

### API endpoints used by the frontend

| Action | Method | Endpoint |
|--------|--------|----------|
| Get all approved services | GET | `/api/services` |
| Search / filter services | GET | `/api/services?category=Health&search=dental` |
| Get single service | GET | `/api/services/:id` |
| Register account | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| Get current user | GET | `/api/auth/me` |
| Submit a service | POST | `/api/services` |
| Get my own listings | GET | `/api/services/my/listings` |
| Admin: get all services | GET | `/api/admin/services` |
| Admin: approve service | PUT | `/api/admin/services/:id/approve` |
| Admin: reject service | PUT | `/api/admin/services/:id/reject` |
| Admin: delete service | DELETE | `/api/admin/services/:id` |

---

## Test Accounts

After running `node seed.js` in the backend, these accounts are available:

| Role | Email | Password | What they can do |
|------|-------|----------|-----------------|
| **Admin** | `admin@communityatlas.rw` | `admin123` | Approve, reject, delete any listing; access Admin Dashboard |
| **Service Provider** | `grace@example.com` | `provider123` | Submit and manage their own service listings |

To register your own account, click **Sign In** in the top navigation and switch to the **Register** tab. Choose your role from the dropdown.

---

## Troubleshooting

### ❌ "Cannot connect to server" when logging in

The frontend cannot reach the backend. Check:
1. Is the backend running? Open a terminal and run `npm run dev` inside `communityatlas-backend/`
2. Is it running on port `5000`? Visit `http://localhost:5000` — you should see a JSON health check response
3. Is the `baseURL` in `App.jsx` set to `http://localhost:5000/api`?

### ❌ Login returns an error even with correct credentials

Make sure you have seeded the database:
```bash
cd communityatlas-backend
node seed.js
```

### ❌ `npm install` fails

Try deleting `node_modules/` and `package-lock.json`, then run `npm install` again:
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Port 3000 is already in use

Vite will automatically try the next available port (3001, 3002, etc.) and display the correct URL in the terminal. If the backend CORS is set to `http://localhost:3000` specifically, update `FRONTEND_URL` in the backend `.env` file to match.

### ❌ Services not showing after logging in

Only **approved** services are shown on the public pages. If the database was just seeded, some services may be in `pending` status. Log in as the admin and approve them from the Admin Dashboard.

---

## Built With

- [React 18](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — development server and bundler
- [Axios](https://axios-http.com) — HTTP client for API calls
- [Google Fonts](https://fonts.google.com) — Playfair Display + DM Sans typography

---

*CommunityAtlas — African Leadership University, 2026*
