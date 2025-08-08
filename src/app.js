import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express()

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN)
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://your-frontend-app.vercel.app" // We'll update this after deployment
    ],
    credentials:true
}))

app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({extended:true, limit:"50mb"}))
app.use(cookieParser())

import authRoutes from './routes/auth.routes.js'
import noteRoutes from './routes/note.routes.js'
import userRoutes from './routes/user.routes.js'

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/notes", noteRoutes)
app.use("/api/v1/user", userRoutes);

export {app}



