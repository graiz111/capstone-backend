import  mongoose from "mongoose";

const restaurantSchema = mongoose.Schema({
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
    review:{
        type:String,
        default:''
    },
    items: [{
         type: mongoose.Schema.Types.ObjectId,
          ref: "ITEMS" }],
    isActive: {
        type: Boolean,
        default: true, 
    },
    role:{
        type:String,
        default:'resturant'
    }
})

export const RESTAURANT = mongoose.model('RESTAURANT', restaurantSchema);
