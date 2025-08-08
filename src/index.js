import { app } from "./app.js";
import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

connectDB()
.then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`🚀 Server running successfully on port ${port}`);
        console.log(`🔗 API endpoint: http://localhost:${port}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    })
})
.catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
})