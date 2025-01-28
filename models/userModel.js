import  mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type:String,
        minlength:3,
        reqired:true,
    },
    email:{
        type:String,
        unique:true,
        reqired:true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], 
    },
    password: {
        type: String,
        required: true,
        minlength: 6, 
    },
    phone:{
        type:String,
        minlength:10,
        reqired:true,
    },
    profilePic:{
        type:String,
        default:''
        
    },
    role:{
        type:String,
        default:"user"
    },
    isActive: {
        type: Boolean,
        default: true, 
    },
})

export const USER = mongoose.model('USER', userSchema);
