import cloudinary from 'cloudinary'


let cloudUpload = cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SEC,
    secure: true,
});


  

export default cloudUpload