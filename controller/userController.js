import User from "../models/User.js";
import crypto from "crypto";
import fs from "fs";
import csv from "fast-csv";
import * as dotenv from "dotenv";
dotenv.config();
// import { putImagestoS3 } from "../utils/S3.js";
// ----------------------------------s3----------------------------
import sharp from 'sharp'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {PutObjectCommand , GetObjectCommand , DeleteObjectCommand} from '@aws-sdk/client-s3'
import s3 from "../utils/S3.js";
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretAccessKey = process.env.BUCKET_SECRET_KEY
const randomImageName = (bytes = 32) =>
crypto.randomBytes(bytes).toString('hex')
// ----------------------------------s3----------------------------


const BASE_URL = process.env.BASE_URL;

export const paginatedUsers = async (req, res) => {
  const page = req.query.page || 1;
  const ITEM_PER_PAGE = 4;
  try {
    const skip = (page - 1) * ITEM_PER_PAGE; // 1 * 4 = 4

    const count = await User.countDocuments();

    const paginatedUsers = await User.find({}).limit(ITEM_PER_PAGE).skip(skip);
      //  ____________________________________________________________________________________
      for (const user of paginatedUsers) {
        
          const getObjectParams = {
            Bucket: bucketName,
            Key: user.profileImg
          }
          const command = new GetObjectCommand(getObjectParams)
          const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
          user.profileImg = url      
      }
      //  ____________________________________________________________________________________
    const pageCount = Math.ceil(count / ITEM_PER_PAGE);
    res.status(200).json({
      Pagination: { count, pageCount },
      paginatedUsers,
    });
  } catch (err) {
    res.status(401).json(err);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find();
  
      //  ____________________________________________________________________________________
      for (const user of allUser) {
        
        const getObjectParams = {
          Bucket: bucketName,
          Key: user.profileImg
        }
        const command = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
        user.profileImg = url
      
    }
    //  ____________________________________________________________________________________
   
    res.status(200).json(allUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const addUser = async (req, res) => {

  const file = req.file;
  const { fname, lname, email, mobile, location, gender } = req.body;

  if (!fname || !lname || !email || !mobile || !gender || !location || !file) {
    res.status(401).json("All Inputs is required");
  }

  const preuser = await User.findOne({ email: email });

  if (preuser) return res.status(401).json("User Already Exists");
 // -------------------------s3-----------------------
    // const randomImageName = (bytes = 32) =>
    //   crypto.randomBytes(bytes).toString('hex')
    const buffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ height: 600, width: 800, fit: 'cover', withoutEnlargement: true })
      .toBuffer()
    const imageName = randomImageName()
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype
    }
    const command = new PutObjectCommand(params)
    await s3.send(command)
  // ----------------------------------------------------------------------

  const phoneNumber = parseInt(mobile);
  const newUser = new User({
    fname,
    lname,
    email,
    phoneNumber,
    location,
    gender,
    profileImg: imageName,
  });
  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getUser = async (req, res) => {
 
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json("User not found");
    // ---------------s3--------------------
    const getObjectParams = {
      Bucket: bucketName,
      Key: user.profileImg
    }
   
    const command = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
    user.profileImg = url
    // ---------------------------------------
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.file, "5555555");
    console.log(req.body, "66666");
    const user=await User.findById(id)
    console.log(user,'user in edit')
    let { fname, lname, email, phoneNumber, gender, location } = req.body;
    phoneNumber = parseInt(phoneNumber);

 // -------------------------s3-----------------------
    console.log('1111111111111111')
    const imageName = randomImageName()
    if(req.file){
      const buffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ height: 600, width: 800, fit: 'cover', withoutEnlargement: true })
      .toBuffer()
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype
    }
    const command = new PutObjectCommand(params)
    await s3.send(command)
    }

  // ----------------------------------------------------------------------
    const updatedUser = await User.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        phoneNumber,
        gender,
        location,
        profileImg: req.file ? imageName : user.profileImg ,
      }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {

    const deletedUser = await User.findByIdAndDelete({ _id: id }); 
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    // -----------------------------s3 delete-----------------
    const params = {
            Bucket: bucketName,
            Key: deletedUser.profileImg
          }
          const command = new DeleteObjectCommand(params)
           await s3.send(command)
    // -----------------------------s3 delete-----------------
    res.status(200).json(deletedUser);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const exportToCsv = async (req, res) => {
  const users = await User.find();

  const csvStream = csv.format({ headers: true });

  if (!fs.existsSync("public/files/export/")) {
    if (!fs.existsSync("public/files")) {
      fs.mkdirSync("public/files/", { recursive: true });
    }
    if (!fs.existsSync("public/files/export")) {
      fs.mkdirSync("./public/files/export/");
    }
  }
  const writablestream = fs.createWriteStream("public/files/export/users.csv");
  csvStream.pipe(writablestream);

  writablestream.on("finish", function () {
    res.json({
      downloadUrl: `${BASE_URL}/files/export/users.csv`,
    });
  });
  if (users.length > 0) {
    users.map((user) => {
      csvStream.write({
        FirstName: user.fname ? user.fname : "-",
        LastName: user.lname ? user.lname : "-",
        Email: user.email ? user.email : "-",
        Phone: user.phoneNumber ? user.phoneNumber : "-",
        Gender: user.gender ? user.gender : "-",
        Profile: user.profileImg ? user.profileImg : "-",
        Location: user.location ? user.location : "-",
      });
    });
  }
  csvStream.end();
  writablestream.end();
};

export const test = async (req, res) => {
  res.send("testinggggggggggggggggggggggggggggg");
};
