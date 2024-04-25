import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./Routes/User.js"
import Match from "./Routes/Match.js"
import Message from "./Routes/Message.js"
import morgan from "morgan";
import { Server } from "socket.io"

import { createServer } from "http";


dotenv.config();

const app = express();


morgan("dev")

// app.use(morgan())

app.use(cors());

app.use(express.json())

app.use(express.urlencoded({extended: true}))

app.use(User);
app.use(Match);
app.use(Message);

app.get("/test", (req, res) => {
  return res.status(200).send("api working perfectly")
})





const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

const port = process.env.PORT || 5000;

try {
  mongoose.connect(process.env.mongoURI, options).then(
    (res) => {
      console.log("db connection established");
    },
    (error) => console.log(error)
  );

const server = createServer(app);


let io = new Server(server, {
  pingTimeout: 6000,
  cors:{
    origin: "*"
  }
})

let onlineuser = []

io.on("connection", (socket) =>{
  // console.log(socket.id);
  

  socket.on("userconnect", (id) =>{

    let user =  onlineuser.find((each) => each.uid === id)

    if(user == undefined){
      onlineuser.push({
        uid: id,
        sid: socket.id
      })

    }else{
     user.sid = socket.id
    }
   
    io.emit("online", onlineuser)
  })

  
  

  socket.on("newmessage", (data) =>{
  
    let user = onlineuser.find((user) => user.uid === data?.receiverId?._id)

  
    if(user != undefined){
      io.to(user.sid).emit("getmessage", data)
    }

   
  })

  
  
  socket.on("disconnect", (reason) =>{
    // console.log("disconnected  " + reason.id);
    let newonlineuser = onlineuser.filter((each) => each.sid !== socket.id)
    
   
    io.emit("online", newonlineuser)
    
  

  })
  
  

 
 
  

})

global.io = io


server.listen(process.env.PORT,() =>{
    console.log("server listening on port "+port);
})




} catch (error) {
  console.log(error.message);
}







