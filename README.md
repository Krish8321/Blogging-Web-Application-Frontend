# Ink. — Premium Editorial Blogging Platform (Frontend)

Welcome to **Ink.**, a handcrafted, distraction-free, premium editorial blogging platform designed for deep reading, clean writing, and private/public community networking. 

This repository contains the **React + Tailwind CSS** frontend, built to integrate seamlessly with a secure Node.js, Express, PostgreSQL, and Redis backend.

---

## 🎨 Design Philosophy & Aesthetics

Unlike generic AI-generated websites, **Ink.** is designed to feel human-crafted, premium, and literary:
*   **Typography First**: Powered by **Lora** (for reading excerpts and full posts) and **Inter** (for clean UI/system controls).
*   **Forced Dark Mode**: Embedded directly into the root layout to provide a consistent, immersive dark-ambient theme reminiscent of the night sky of Gotham.
*   **Minimalist Layouts**: Clean, single-column typographic layouts for article feeds, ensuring readers focus purely on words.
*   **Batman Brand Accents**: 
    *   A custom metallic **Dark Knight bat logo** in the header.
    *   A custom **Batman favicon** in the browser tab.
    *   A bottom yellow-gold accent divider line on user profiles.
    *   A signature Bruce Wayne copyright footnote in the layout wrapper.

---

## 🚀 Key Features

### 1. 🔒 Security-First JWT Auth & Silent Refresh
*   Uses a secure dual-token strategy. The short-lived **Access Token** is stored in memory, while the long-lived **Refresh Token** is stored in an **HTTP-only cookie** set by the backend.
*   An **Axios Interceptor** (`src/hooks/useApi.js`) catches expired token errors (`401 Unauthorized`), pauses requests, silently obtains a new access token, and retries the original actions without any login flickeing or session disruption.

### 🚦 Smart Entry Auth Redirects
*   If a guest visits the root (`/`), they are redirected immediately to the `/login` or `/register` screens.
*   Once logged in, they are redirected straight to their personal `/dashboard`.
*   The main feed is hosted on the protected `/feed` route to ensure community posts are readable only by authenticated users.

### 👥 Social & Discovery
*   **Verified Creator Directory** (`/discover`): Queries the backend `GET /api/users` endpoint on mount to show registered, verified users on the platform.
*   **Targeted Username Search**: A search box linked to `GET /api/users/search?username=<query>` enables direct matching of creators by their usernames.
*   **Public/Private Accounts**: Users can toggle account privacy. Private accounts require approved follow requests to unlock posts and details.

### ✍️ Editorial Dashboard & Canvas
*   **Draft & Publish Console**: A personal `/dashboard` to manage posts sorted by Drafts, Published, and Archived tabs.
*   **Nested Interactive Comments**: Threaded replies underneath articles allowing active discussions.

---

## 📁 Project Structure

```text
src/
├── components/
│   └── Navbar.jsx         # Responsive navigation header containing the Dark Knight logo
├── context/
│   └── AuthContext.jsx    # Global session provider (login, register, reset password, profile edit)
├── hooks/
│   └── useApi.js          # Axios API instance with automated refresh token interceptor
├── pages/
│   ├── Home.jsx           # Clean, centered article feed column
│   ├── Discover.jsx       # Creator search and directory
│   ├── Profile.jsx        # Gradient header banner profile page
│   ├── Dashboard.jsx      # Draft/Live post organizer console
│   ├── WritePost.jsx      # Text-only writing canvas
│   ├── PostDetail.jsx     # Read view + nested comments
│   └── Login.jsx          # Secure login forms
├── App.jsx                # Router config and protected route guards
└── main.jsx               # App entry & theme bootstrap initialization
```

---

## 🛠️ Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed on your system.

### 2. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 3. Run Development Server
Start the frontend locally:
```bash
npm run dev
```
The application will start on `http://localhost:5173`. Make sure your backend service is running on `http://localhost:5000`.

### 4. Build for Production
To build static assets for production:
```bash
npm run build
```
This generates a production-optimized `dist` folder.
