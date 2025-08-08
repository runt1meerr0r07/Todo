import { Note } from "../models/note.model.js";
import { User } from "../models/user.model.js";

const createNote=async(req,res)=>{
    try {
        const {title,body,image, drawing}=req.body
        if (!title) 
        {
            return res.status(400).json({ message: "Title is required" })
        }
        const userId=req.user.id
        // const user=await User.findById(userId)
        // if(!user)
        // {
        //     return res.status(400).json(
        //         {
        //             success:false,
        //             message:"User not found"
        //         }
        //     )
        // }
        const note=await Note.create({
            title,
            body,
            image,
            drawing,
            owner:userId
        })
        if(!note)
        {
            return res.status(400).json({
                success:false,
                message:"Note not created",
                error:"Note creation error"
            })
        }
        return res.status(201).json({
            success:true,
            message:"Note created successfully",
            data:note
        })
    } 
    catch (error) 
    {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


const getNotes=async(req,res)=>{
    try {
        const userId=req.user.id
        const notes= await Note.find({owner:userId})
    
        return res.status(200).json({
            success:true,
            message:"Notes fetched successfully !!!",
            data:notes
        })
    } 
    catch (error) 
    {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const updateNote=async(req,res)=>{
    try {
        const { id } = req.params 
        const {newTitle,newBody}=req.body
        const userId=req.user.id

        const fetchedNote= await Note.findOneAndUpdate(
            { _id:id , owner: userId },
            { title: newTitle, body: newBody },
            {new:true}
        )
        if (!fetchedNote) 
        {
            return res.status(404).json({
                success: false,
                message: "Note not found or you don't have permission"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Note updated successfully",
            data:fetchedNote
        })
    } 
    catch (error) 
    {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }


}

const deleteNote=async(req,res)=>{
    try {
        const { id } = req.params 
        const userId=req.user.id

        const fetchedNote= await Note.findOneAndDelete({_id:id,owner:userId})
        if (!fetchedNote) 
        {
            return res.status(404).json({
                success: false,
                message: "Note not found or you don't have permission"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Note deleted successfully",
            data: {
                deletedNote: fetchedNote._id,
                title: fetchedNote.title,
                body:fetchedNote.body
            }
        })
    } 
    catch (error) 
    {
        return res.status(500).json({
            success: false,
            message: error.message
            
        })
    }


}

export {createNote,getNotes,updateNote,deleteNote}