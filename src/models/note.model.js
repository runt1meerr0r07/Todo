import mongoose,{Schema} from "mongoose";

const noteSchema=new Schema({

    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:false, 
        default:""      
    },
    image:{
        type:String,
        default:null
    },
    drawing:{
        type:String,
        default:null
    },
    position:{
        type:Number,
        default:0
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }},
    {
        timestamps:true
    }
)

export const Note=mongoose.model("Note",noteSchema)