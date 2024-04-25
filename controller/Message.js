import formidable from "formidable";
import chat from "../Models/Chat.js";
import messages from "../Models/Message.js";
import mongoose from "mongoose";
import dotenv from "dotenv"
import cloudinary from "cloudinary"

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
  secure: true,
});


const ObjectId = mongoose.Types.ObjectId;

const sendMessage = async (req, res) => {

  if (req.login == "invalid credentials") {
    res.status(400).json({ msg: "invalid credentials" });
  } else if (req.login == "authenticated error") {
    res.status(400).json({ msg: "invalid credentials" });
  } 
  else {
    let form = new formidable.IncomingForm({multiples: true});
    form.parse(req, async (err, fields, files) => {
      const { uid, loginid, message } = fields;
      const { images } = files

      let photos = [];

    try{


      if(images?.length === undefined && images?.originalFilename !== ""){
        
        await cloudinary?.v2.uploader.upload( images?.filepath,
          { folder: "tinderclone" },
          async (error, result) => {
            const url = result?.secure_url;
            const id = result?.public_id;
            photos?.push({url, id})
        })

      }else if(images?.length > 0){
        for(let each of images){

          await cloudinary?.v2?.uploader?.upload( each?.filepath,
            { folder: "tinderclone" },
            async (error, result) => {
              const url = result?.secure_url;
              const id = result?.public_id;
              photos?.push({url, id})
          })

        }
      }

      
      let existingchat = await chat.findOne({
        members: {
          $all: [uid, loginid],
        },
      });


      if (existingchat == null) {
        let newchat = await chat.create({
          members: [uid, loginid],
        });


        await messages
          .create({
            chatId: newchat._id,
            senderId: loginid,
            receiverId: uid,
            text: message,
            photos: photos
          })
          .then(async(data) => {
            let fulldata = await messages.findById(data._id).populate("senderId").populate("receiverId")
            
            res.status(200).json(fulldata);
            
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        await messages
          .create({
            chatId: existingchat._id,
            senderId: loginid,
            receiverId: uid,
            text: message,
            photos: photos
          })
          .then(async(data) => {
            let fulldata = await messages.findById(data._id).populate("senderId").populate("receiverId")
            console.log(fulldata);
            res.status(200).json(fulldata);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    
    }catch(error){
      console.log(error);
    }
    });
  }
};

const fetchPreviousChats = async (req, res) => {
  const { id } = req.params;

  let chatids = await chat.find({ members: { $in: [id] } }).select("_id");

  let originalIds = chatids?.map((id) => ObjectId(id));

  await messages
    .aggregate([
      {
        $match: {
          chatId: {
            $in: [...originalIds],
          },
        },
      },

      {
        $sort: { createdAt: -1 },
      },

    
      
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "senderId",
          foreignField: "_id",
          as: "sender",
        },
      },


      {
        $group: {
          _id: "$chatId",
          docs: {
            $first: "$$ROOT",
          },
        },
      },


      
     
    ]).sort({createdAt: -1})
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      console.log(err);
    });
};


const fetchExistingMessage = async(req, res) =>{

  const { loginid, uid} = req.query


  let chatId = await chat.findOne({
    members:{
      $all:[loginid, uid]
    }
  })



  if(chatId !== null){
    let prevMsg = await messages.find({
      chatId: chatId._id
    }).populate("senderId").populate("receiverId")

    res.status(200).json(prevMsg);
  }

}


export { sendMessage, fetchPreviousChats, fetchExistingMessage };
