# WorkTrack - Setup & Run Guide

## Prerequisites

- **Node.js** v18+ (download from [nodejs.org](https://nodejs.org))
- **MongoDB** - Use MongoDB Atlas (free tier) or local MongoDB
- **Git** (optional)

---

## Step 1: Clone / Navigate to Project

```bash
cd worktrack
```

---

## Step 2: Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure environment variables
# Edit server/.env with your MongoDB URI and secrets:
#   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/worktrack
#   JWT_SECRET=your_random_secret
#   JWT_REFRESH_SECRET=another_random_secret

# Start the server (development mode with auto-reload)
npm run dev
```

Server will start on **http://localhost:5000**.

---

## Step 3: Frontend Setup

Open a **new terminal** (keep server running).

```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will start on **http://localhost:5173**.

---

## Step 4: Verify It Works

### Backend Health Check
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"manager"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Frontend
- Open **http://localhost:5173** in your browser
- Register or login
- Create tasks on the Tasks page
- Submit EOD report from the Dashboard
- View attendance and analytics

---

## Step 5: Using the Application

### Roles
| Role | Access |
|------|--------|
| **Employee** | Own tasks, attendance, personal analytics |
| **Manager** | Everything in Employee + team dashboard |
| **Admin** | Everything in Manager + system metrics |

### Daily Workflow
1. **Login** → Automatically marks you present for the day
2. **Add Tasks** → Create your task list for the day
3. **Work & Update** → Mark tasks as done as you complete them
4. **Submit EOD** → At end of day, submit EOD report to complete attendance

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `MongooseServerSelectionError` | Check MongoDB URI in `server/.env` |
| `CORS error` | Ensure `CLIENT_URL` in `.env` matches frontend URL |
| Port already in use | Change `PORT` in `server/.env` or kill existing process |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, retry |
| Token expired | Login again — tokens auto-refresh on frontend |
