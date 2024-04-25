import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const userSchema = mongoose.Schema({
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: Date, default: 18},
    pass: {type: String, required: true},
    loc: {type: Object},
    photos: {
        type: Array, 
        validate: [
            function(data){
            return data.length <=5
            }, 
            "maximum of 5 photos!!! delete previous to upload new"]
        
    },
    gender: {type: String, default: "male" },
    interest: {type: String, default: "female"},
    about: {type: String},
    req: [
        {type: mongoose.Types.ObjectId, ref: "users"}
    ],
    likes: [
        {type: mongoose.Types.ObjectId, ref: "users"}
    ],
    hobbies: { type: Array, default: [process.env.APPNAME]},
    friends: [
        {type: mongoose.Types.ObjectId, ref: "users"}
    ],
},
{ timestamps: true}
)





const User = mongoose.model('users', userSchema)
export default User