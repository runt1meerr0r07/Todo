import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(process.env.MONGODB_URI)
        console.log(`DB CONNECTED ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("Error connecting to Database", error)
        process.exit(1)
    }
}
export default connectDB