import { app } from "./app.js";
import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";

dotenv.config();
connectDB()
.then(
    ()=>{
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`DB CONNECTED ON PORT ${process.env.PORT}`)
            console.log("Server Running successfully")
        })
    }
)
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})