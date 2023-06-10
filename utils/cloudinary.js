import cloudinaryHelper from "cloudinary"
const cloudinary=cloudinaryHelper.v2
import * as dotenv from 'dotenv';
dotenv.config()
console.log(process.env.CLOUD_NAME)

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_KEY_SECRET 
  });

  export default cloudinary