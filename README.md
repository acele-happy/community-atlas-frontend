# 🗺️ CommunityAtlas — Frontend

> A community-driven digital map for discovering local services in Rwandan communities.  
> Built with **React** + **Vite** + **Axios**

---

## Project Overview

CommunityAtlas is a web platform that helps residents of Gasabo district find local services like health centers, schools, businesses, and community organizations. Service providers can register and list their services, and community administrators can review and moderate submissions.

This repository contains the **React frontend only**. The [CommunityAtlas Backend](https://github.com/acele-happy/community-atlas-backend) is in a different repository and also hosted on render.

---

## Prerequisites

Before you begin, make sure the following are installed on your computer:

| Tool | Minimum Version | How to check | Download |
|------|----------------|--------------|----------|
| Node.js | v18 or higher | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | v8 or higher | `npm --version` | Comes with Node.js |
| Git | Any | `git --version` | [git-scm.com](https://git-scm.com) |

> **Make sure the backend server is also running** on `http://localhost:5000` before using the app.

---

## Installation

Follow these steps **exactly** in order:

### Step 1 — Clone or download the project

If you have the project as a zip file, extract it. If you are cloning from GitHub:

```bash
git clone https://github.com/acele-happy/community-atlas-frontend
cd community-atlas-frontend
```

### Step 2 — Navigate into the frontend folder

```bash
cd community-atlas-frontend
```

### Step 3 — Install dependencies

This installs React, Axios, Vite, and all other required packages:

```bash
npm install
```

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

The frontend connects to the backend API. By default it points to `https://community-atlas-backend-4a9r.onrender.com`.

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

```
🚀 Server running
✅ MongoDB connected: ...
```

### Step 2 — Start the frontend development server

In your frontend terminal:

```bash
npm run dev
```
### Step 3 — Open the app in your browser

Go to: **http://localhost:5173/**

The app should load and display the CommunityAtlas home page.

---

## Test Accounts

After running `node seed.js` in the backend, these accounts are available:

| Role | Email | Password | What they can do |
|------|-------|----------|-----------------|
| **Admin** | `admin@mail.com` | `123456` | Approve, reject, delete any listing; access Admin Dashboard |
| **Service Provider** | `a.irakoze@irembo.com` | `123456` | Submit and manage their own service listings |

To register your own account, click **Sign In** in the top navigation and switch to the **Register** tab. Choose your role from the dropdown.
---

*CommunityAtlas — African Leadership University, 2026*
