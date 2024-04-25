import User from "../Models/User.js";
import cloudinary from "cloudinary";
import formidable from "formidable";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
  secure: true,
});

const register = async (req, res) => {
  const form = new formidable.IncomingForm();

  form?.parse(req, async (err, fields, files) => {
    const {
      fname,
      lname,
      interest,
      gender,
      about,
      age,
      location,
      password,
      email,
      confirmpassword,
    } = fields;
    const { photo } = files;

    try {
      if (
        fname === "" ||
        !fname ||
        email === "" ||
        !email ||
        lname === "" ||
        !lname ||
        password === "" ||
        !password ||
        confirmpassword === "" ||
        !confirmpassword
      ) {
        throw new Error("enter all fields");
      }

      await User.findOne({ email: email }).then((data) => {
        if (data !== null) {
          throw new Error("Email Already Exist");
        }
      });

      if (password.length < 5) {
        throw new Error("password must be greater than 5");
      }

      if (password !== confirmpassword) {
        throw new Error("password do not match");
      }

      if (photo !== undefined && photo.originalFilename !== "") {
        await cloudinary?.v2?.uploader?.upload(
          photo?.filepath,
          { folder: "tinderclone" },
          async (error, result) => {
            const url = result?.secure_url;
            const id = result?.public_id;

            await bcrypt.hash(password, process.env.SALT).then((hash) => {
              const user = new User({
                fname,
                lname,
                age: age,
                email: email,
                pass: hash,
                photos: [{url, id}],
                loc: JSON.parse(location),
                about: about,
                interest: interest,
                gender: gender,
              });

              user.save();

              res.status(200).json({ msg: "account successfully created" });
            });
          }
        );
      } else {
        throw new Error("upload profile photo");
      }
    } catch (error) {
      res?.status(400).json({ msg: error.message });
    }
  });
};

const login = async (req, res) => {
  let form = new formidable.IncomingForm();

  try {
    form.parse(req, async (err, fields) => {
      const { email, password } = fields;

     

      User.findOne({ email: email }).then(async (user) => {
        
        if (user === null) {
          res.status(400).json({ msg: "email not found" });
        } else {
          let checkPwd = await bcrypt.compare(password, user.pass);
          

          if (checkPwd) {
            let token = jwt.sign(
              { id: user._id, email: user.email },
              process.env.TOKEN,
              { expiresIn: "3d" }
            );

            res.status(200).json(token);
          } else {
            res.status(400).json({ msg: "invalid credentials" });
          }
        }
      });
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const fetchUser = async (req, res) => {
  if (req.login == "invalid credentials") {
    res.status(400).json({ msg: "invalid credentials" });
  } else if (req.login == "authenticated error") {
    res.status(400).json({ msg: "invalid credentials" });
  } else {
    const { id, email } = req.login;

    User.findOne({ email })
    .populate("friends")
    .then((user) => {
      if (user == null) {
        res.status(400).json({ msg: "User not found" });
      } else {
        res.status(200).json(user);
      }
    });
  }
};

const fetchUserById = async (req, res) => {
  
    const { id } = req.params;

    User.findById(id)
    .then((user) => {
      if (user == null) {
        res.status(400).json({ msg: "User not found" });
      } else {
        res.status(200).json(user);
      }
    });
  
};

const updateUser = async (req, res) => {
  const form = new formidable.IncomingForm();

  try {
    form.parse(req, async (err, fields, files) => {
      const { id } = req.params;

      const { fname, oldfname, lname, oldlname, age, oldage, about, oldabout } = fields;

  
      let user = await User.findByIdAndUpdate(id,{
        fname: fname === "" ? oldfname : fname,
        lname: lname === "" ? oldlname : lname,
        age: age === "" ? oldage : age,
        about: about === "" ? oldabout : about
      },{
        new: true
      })

      res.status(200).json(user)



    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const updateimg = async (req, res) => {
  if (req.login == "invalid credentials") {
    res.status(400).json({ msg: "invalid credentials" });
  } else if (req.login == "authenticated error") {
    res.status(400).json({ msg: "invalid credentials" });
  } else {
    const form = new formidable.IncomingForm({multiples: true});

    try {
      form.parse(req, async (err, fields, files) => {
        const { images } = files;
       const {id} = req.login

      let user = await User.findById(id)

       if(images?.length == undefined && images?.originalFilename == ""){
        res.status(400).json({msg: "no image upload"})

       }else if(images?.length == undefined && images?.originalFilename != ""){

        await cloudinary.v2.uploader.upload(images.filepath, { folder: "tinderclone" }, async (error, result) => {
        
          if(err){
            res.status(400).json({ msg: err.message });
          }else{
          
          const url = result?.secure_url;
          const id = result?.public_id

          user?.photos?.push({url, id})

          await user.save()
          .then((data) => res.status(200).json(data))
          .catch((err) => {
            // console.log(err.errors.photos.ValidationError);
            res.status(400).json(err.errors)
          })
        
          }
      })


       }else if(images?.length > 0){

        

        for(let i = 0; i < images?.length; i++){
          await cloudinary.v2.uploader.upload(images[i].filepath, { folder: "tinderclone" }, async (error, result) => {
      
            if(err) console.log(err);
            
             const url = result?.secure_url;
             const id = result?.public_id
    
             user?.photos?.push({url, id})
    

            
          })

          await user.save()
          .then((data) => res.status(200).json(data))
          .catch((err) => {
            res.status(400).json({ msg: err.message });
          })

        }


       }   
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  }
};

const deletepic = async(req, res) =>{
  const {userid, id} = req.query

  await User.findById(userid)
  .exec()
  .then((data) =>{
    const index = data?.photos?.filter((item) => item.id !== id)

    data.photos = index
    data.save()
   .then((data) => res.status(200).json(data))
   .catch((err) => res.status(400).json(err.message));
  })
}

export { register, login, fetchUser, fetchUserById, updateimg, updateUser, deletepic };
