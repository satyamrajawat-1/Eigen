import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import userRouter from "./routes/user.routes.js"
import eventRouter from "./routes/event.routes.js"
import teamRouter from "./routes/team.routes.js"

const app = express();

// ── Ensure upload directory exists (Render has ephemeral fs) ──
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'public', 'temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cookieParser())

// ── CORS: production-ready ──
// Set CORS_ORIGIN env var on Render as a comma-separated list,
// e.g.  https://eigen-fest.vercel.app,https://eigen-fest.netlify.app
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

// Always allow these origins
allowedOrigins.push(
    "http://localhost:5173",
    "http://localhost:5174",
    "https://eigen-sigma.vercel.app"
);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Render health-checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Log rejected origins for debugging
        console.log(`CORS blocked origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Accept"]
}))

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    limit:"16kb",
    extended:true
}))

app.use(express.static("public"))

// ── HEALTH CHECK (Render pings GET / by default) ──
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", service: "eigen-backend", timestamp: new Date().toISOString() });
});

// --- 1. ROUTES ---
app.use("/api/v1/users" , userRouter)
app.use("/api/v1/events" , eventRouter)
app.use("/api/v1/teams" , teamRouter)

// --- 2. GLOBAL ERROR HANDLER (MUST BE EXACTLY HERE) ---
// This acts as the final safety net. If any route above throws an ApiError, 
// it falls into this function, which forces Express to send clean JSON instead of an HTML crash page.
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message,
        // Optional: Only show the full red error text in the console if on localhost
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export {app}