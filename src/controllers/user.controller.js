import { User } from "../models/user.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const registerUser=async(req,res)=>{
   try {
     const {username,email,password}=req.body
     if(!username || !email || !password)
     {
         return res.status(400).json({
             success:false,
             message:"All fields required",
             error:"Validation Error"
         })
     }

     const saltRounds=10
     const hashedPassword= await bcrypt.hash(password,saltRounds)

     const user=await User.create({
         username,
         email,
         password:hashedPassword
     })
 
     if(!user)
     {
         return res.status(400).json({
             success:false,
             message:"User not created",
             error:"Registration Error"
         })
     }
     const createdUser=await User.findById(user._id).select("-password")
 
     return res.status(200).json(
         {
            message:"User created Successfully",
            success:true,
            data:createdUser
         }
     )
   } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
   }

    
}

const loginUser= async(req,res)=>{
    try {
        const {username,password}=req.body
        if(!username || !password)
        {
            return res.status(400).json({
                success:false,
                message:"Username and password are required"
            })
        }
    
        const user=await User.findOne({username})
    
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"User not found"
            })
        }
    
        const isPasswordValid= await bcrypt.compare(password,user.password)
    
        if(!isPasswordValid)
        {
            return res.status(401).json({
                success:false,
                message:"Invalid Password"
            })
        }

        const token=jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRATION}
        )
        
        const options = {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        }
        
        const loggedInUser = {
            _id: user._id,
            username: user.username,
            email: user.email
        }
        
        return res.status(200)
        .cookie('token', token, options)
        .json({
            message: "Login Successful",
            success: true,
            token: token,
            data: loggedInUser
        })
    
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}

const authCheck = async(req,res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ success: false, message: "No token found" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }
        
        return res.status(200).json({
            success: true, 
            message: "User is authenticated",
            userId: decoded.userId
        })
    } 
    catch (error) {
        return res.status(401).json({
            success: false, 
            message: "Token verification failed"
        })
    }
}

const updateTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const { darkMode } = req.body;
        const user = await User.findByIdAndUpdate(
            userId,
            { darkMode },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, darkMode: user.darkMode });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const getTheme = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, darkMode: user.darkMode });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
const logoutUser = async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            secure: true
        }
        
        return res
            .status(200)
            .clearCookie("token", options)
            .json({
                success: true,
                message: "User logged out successfully"
            })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error during logout",
            error: error.message
        })
    }
}

export { registerUser, loginUser, authCheck, updateTheme, getTheme, logoutUser }