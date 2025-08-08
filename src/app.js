import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://localhost:5173", 
        process.env.CORS_ORIGIN,
        "https://*.vercel.app", 
        "https://*.onrender.com" 
    ].filter(Boolean), 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(cookieParser())


app.get("/", (req, res) => {
    res.json({ 
        message: "TodoTrial API is running successfully!",
        status: "active",
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development',
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



