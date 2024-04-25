import mongoose from "mongoose"

const chatSchema = mongoose.Schema({
 
   members:[
    {type: mongoose.Types.ObjectId, ref: "users"}
   ]
   
    
},{
    timestamps: true
})

const chat = mongoose.model('chat', chatSchema)
export default chat