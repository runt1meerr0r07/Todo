import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()


app.use(cors({
    origin: (origin, callback) => {
        
        if (!origin) return callback(null, true);
        
        if (origin.includes('localhost') || 
            origin.includes('vercel.app') || 
            origin.includes('onrender.com')) {
            return callback(null, true);
        }
      
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    optionsSuccessStatus: 200
}))

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && (origin.includes('localhost') || origin.includes('vercel.app') || origin.includes('onrender.com'))) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, PATCH, POST, PUT');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(cookieParser())

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



