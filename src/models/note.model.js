import mongoose,{Schema} from "mongoose";

const noteSchema=new Schema({

    title:{
        type:String,
        required:true
    },
    body:{
        type:String
    },
    image:{
        type:String
    },
    drawing:{
        type:String
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }},
    {
        timestamps:true
    }
)

export const Note=mongoose.model("Note",noteSchema)