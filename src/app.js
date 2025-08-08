import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://localhost:5173",
        "https://todo-sooty-theta-97.vercel.app", // Your Vercel URL
        "https://*.vercel.app" // Allow all Vercel apps
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    optionsSuccessStatus: 200 // For legacy browser support
}))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(cookieParser())

// Add CORS headers middleware for additional safety
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
    res.header('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, PATCH, POST, PUT');
    next();
});

// Root endpoint
app.get("/", (req, res) => {
    res.json({ 
        message: "TodoTrial API is running successfully!",
        status: "active",
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development',
        cors: {
            origin: req.headers.origin,
            allowed: true
        },
        endpoints: {
            auth: "/api/v1/auth",
            notes: "/api/v1/notes", 
            user: "/api/v1/user"
        }
    })
})

import authRoutes from './routes/auth.routes.js'
import noteRoutes from './routes/note.routes.js'
import userRoutes from './routes/user.routes.js'

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes)
app.use("/api/v1/user", userRoutes);

export { app }



