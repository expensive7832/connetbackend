import mongoose from "mongoose"

const messageSchema = mongoose.Schema({
   
    chatId: {
        type: mongoose.Types.ObjectId, ref: "chat"
    },
    senderId: {
        type: mongoose.Types.ObjectId, ref: "users"
    },
    receiverId: {
        type: mongoose.Types.ObjectId, ref: "users"
    },
    text: {
        type: String
    },
    photos: []
    
},{
    timestamps: true
})

const messages = mongoose.model('messages', messageSchema)
export default messages