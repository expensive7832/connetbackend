import express from "express";
import mongoose from "mongoose";
import formidable from "formidable";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import Register from "../Models/Register.js";
import Message from "../Models/Message.js";

dotenv.config();


const router = express.Router();

router.post("/getFriendList", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async(err, fields, files) => {
    const { id } = fields;

    try {

      const getUser = await Register.findById(id)
      const ids = getUser.friends.map((friend) => friend) 
      
      const friendList = await Register.find({ _id: { $in: ids } });
      
      res.status(200).json({friendList: friendList})

     
    } catch (error) {
      res?.json({ msg: error });
    }
  });
});

router.post("/update/:id", (req, res) => {
  const form = new formidable.IncomingForm();
  form?.parse(req, async (err, fields, files) => {
    const { id } = fields;

    try {
      const user = await Register.findById(id);
      res.status(200).json(user);
    } catch (error) {
      res?.json({ msg: error });
    }
  });
});

router.delete("/delete/:id", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      const { id } = req.params;
      await Register.findByIdAndDelete(id);

      res.status(201).json({ msg: "successfully deleted", type: "success" });
    } catch (error) {
      res.status(400).json(error);
    }
  });
});

router.post("/changepic/:id", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    const { id } = req.params;
    const { imageId } = fields;
    const { profImg } = files;

    try {
      if (imageId !== "") {
        await cloudinary?.uploader?.destroy(imageId, (err, result) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log(result);
          }
        });
      }

      await cloudinary?.v2?.uploader?.upload(
        profImg?.filepath,
        { folder: "tinderclone" },
        async (error, result) => {
          const imgUrl = result?.secure_url ? result?.secure_url : "";
          const imgId = result?.public_id ? result?.public_id : "";

          const user = await Register.findOneAndUpdate(
            { _id: id },
            { photoId: imgId, photo: imgUrl },
            {
              new: true,
            }
          );

          if (user) {
            res
              .status(201)
              .json({
                msg: "image successfully updated",
                img: imgUrl,
                photoId: imgId,
              });
          }
        }
      );
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  });
});

router.post("/match/", (request, res) => {
  const form = new formidable.IncomingForm();
  form.parse(request, async (err, fields, files) => {
    const { swipeId } = fields;
    const { loginId } = fields;

    try {
      const CheckUR = await Register.findById(loginId); //check user request ( checkUR)

      const list = await CheckUR?.req?.find((rL) => rL === swipeId); //request list (rL)

      if (!list) {
        await Register.findOneAndUpdate(
          { _id: loginId },
          { $push: { req: swipeId } }
        );
      
      }

      const swipeUser = await Register.findById(swipeId);

      const swipeUL = swipeUser.req.find((rL) => rL === loginId); //swipe user list (swipeUL)

      if (swipeUL) {
        await Register.findOneAndUpdate(
          { _id: loginId },
          { $push: { friends: swipeId } }
        );
        await Register.findOneAndUpdate(
          { _id: swipeId },
          { $push: { friends: loginId } }
        );

      return res.status(201).json({ msg: "match", loginUser: loginId, swipeUser: swipeId });
      }
    } catch (error) {
      console.log(error.message);
    }
  });
});


router.post("/getmatch/", (request, res) => {
  const form = new formidable.IncomingForm();
  form.parse(request, async (err, fields, files) => {
    const { swipeId } = fields;
    const { loginId } = fields;

    try {
     
        const loginUser = await Register.findById(loginId); //check user request ( checkUR)
        const swipeUser = await Register.findById(swipeId); //check user request ( checkUR)

        res.status(200).json({loginUser: loginUser, swipeUser: swipeUser});

    } catch (error) {
      res.status(400).json(error.message);
    }
  });
});


router.post("/chat", (request, res) => {
  const form = new formidable.IncomingForm();
  form.parse(request, async(err, fields, files) => {
    const { loginId, clickId} = fields;

    try {
     const ids = loginId > clickId ? loginId + clickId : clickId + loginId ;
    
    const getMessage = await Message.findOne({id: ids})

     res.status(202).json({msg: getMessage})
      

    } catch (error) {
      res.status(400).json(error.message);
    }
  });
});


router.post("/clickUser", (request, res) => {
  const form = new formidable.IncomingForm();
  form.parse(request, async(err, fields, files) => {
    const { clickId} = fields;

    try {
     
    
    const getUser = await Register.findOne({_id: clickId})

     res.status(202).json({user: getUser})
      

    } catch (error) {
      res.status(400).json(error.message);
    }
  });
});


export default router;
