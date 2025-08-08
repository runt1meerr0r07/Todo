import mongoose,{Schema} from "mongoose";

const userSchema= new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        darkMode:{
        type:Boolean,
        default:true
        }
    },{
        timestamps:true
    }
)

export const User=mongoose.model("User",userSchema)