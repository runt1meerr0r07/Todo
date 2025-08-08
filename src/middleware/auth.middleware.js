import jwt from "jsonwebtoken"
const verifyAuth=async(req,res,next)=>{
    try {
        const token=req.cookies.token || req.headers.authorization?.replace('Bearer ', '')
    
        if (!token) 
        {
            return res.status(401).json({ message: "Token required" })
        }
    
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
    
        if(!decoded)
        {
            return res.status(401).json({
                success:false,
                message:"User not logged in"
            })
        }
        req.user = { id: decoded.userId }
        next()
    } 
    catch (error) 
    {
        return res.status(401).json({ message: "Invalid token" })
    }

}

export { verifyAuth }