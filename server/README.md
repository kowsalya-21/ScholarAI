# ScholarAI – AI-Powered Scholarship Discovery Engine (Backend)

ScholarAI is a scalable, secure, and production-ready Express backend foundation configured to power a modern scholarship discovery and recommendation platform.

---

## Features Built in this Foundation
- **Modern ES Module Structure**: Configured with `"type": "module"` for clean import/export syntax.
- **Robust Security**: Configured with `helmet` for secure HTTP headers and `cors` for safe cross-origin resource access.
- **Global Error Handling**: Built-in centralized middleware translating Mongoose, database duplicate keys, and JWT verification errors into clean JSON formats.
- **Dynamic Database Reporting**: MongoDB connection checks on startup, with event-driven logging (`connected`, `error`, `disconnected`) and graceful cleanup handlers.
- **Health Verification API**: Live check endpoints to audit API and Database availability dynamically.
- **Strict Development Workflows**: Configured with `nodemon` for hot-reloading and `.env` configuration structures.

---

## Folder Structure

```text
server/
│── config/          # Global configuration (e.g. Database connection)
│   └── db.js
│── controllers/     # Controller layer (handles request-response logic)
│   └── .gitkeep
│── middleware/      # Custom middleware (auth, logging, global error handlers)
│   └── errorMiddleware.js
│── models/          # Mongoose schemas/models defining data entities
│   └── .gitkeep
│── routes/          # API route definitions mapping to controllers
│   └── health.js
│── services/        # Service layer for isolated business/AI logic
│   └── .gitkeep
│── utils/           # Shared utility classes and functions
│   ├── appError.js
│   └── asyncHandler.js
│── validations/     # Input schema validations (express-validator rules)
│   └── .gitkeep
│── uploads/         # Local folder holding file uploads/assets
│   └── .gitkeep
│── server.js        # Main execution entry point (process configuration, listener)
│   └── app.js       # App configuration (Express initialization, middleware bindings)
│── package.json     # Project manifest and package configurations
│── .env.example     # Reference template for required environment variables
│── .gitignore       # Untracked files configuration
└── README.md        # Technical guidelines & documentation
```

---

## Installation & Local Setup

### Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18+ recommended)
- **npm** (comes with Node.js)
- **MongoDB** (local community server OR a MongoDB Atlas account)

### Steps

1. **Clone or Navigate to the Workspace**
   ```bash
   cd c:\Users\hp\Documents\ScholarAI\server
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Duplicate `.env.example` to create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and customize the variables to match your system specs.

---

## MongoDB Atlas Connection Guide

To link your remote MongoDB Atlas Database:

1. **Log in to MongoDB Atlas** and go to your cluster panel.
2. Click **Connect** on your target database cluster.
3. Select **Drivers** (Node.js).
4. Copy the connection string. It should look like:
   ```text
   mongodb+srv://<db_username>:<db_password>@<cluster-url>/scholarai?retryWrites=true&w=majority
   ```
5. In your local `.env` file, replace the placeholder `MONGODB_URI` value with your actual connection string. Make sure to replace `<db_username>` and `<db_password>` with your database user credentials!

---

## Run Commands

Run the following commands inside the `server/` directory:

### Development Mode (with Nodemon auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

## Verification Checkpoints

### Root URL Check
- **Endpoint**: `GET http://localhost:5000/`
- **Expected Response (JSON)**:
  ```json
  {
    "success": true,
    "message": "ScholarAI Backend Running Successfully"
  }
  ```

### API & Database Health Check
- **Endpoint**: `GET http://localhost:5000/api/health`
- **Expected Response (JSON)**:
  ```json
  {
    "status": "OK",
    "database": "Connected"
  }
  ```
  *(Note: If the MONGODB_URI is not set up yet, the database status will dynamically report `"Disconnected"` instead of throwing an unhandled exception.)*
