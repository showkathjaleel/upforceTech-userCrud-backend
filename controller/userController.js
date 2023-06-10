import User from "../models/User.js";
import cloudinary from "../utils/cloudinary.js";
import crypto from "crypto";
import fs from "fs";
import csv from "fast-csv";
import * as dotenv from "dotenv"
console.log(process.env.BASE_URL)

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

  const BASE_URL=process.env.BASE_URL

export const paginatedUsers = async (req, res) => {
  console.log('[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[')
  const page = req.query.page || 1;
//   console.log(page);
  const ITEM_PER_PAGE = 4;
  try {
    const skip = (page - 1) * ITEM_PER_PAGE; // 1 * 4 = 4

    const count = await User.countDocuments();

    const paginatedUsers = await User.find({}).limit(ITEM_PER_PAGE).skip(skip);
    const pageCount = Math.ceil(count / ITEM_PER_PAGE);
    res.status(200).json({
      Pagination: { count, pageCount },
      paginatedUsers,
    });
  } catch (err) {
    res.status(401).json(err);
  }
};



export const getAllUsers = async(req, res) =>{
  try{
    const allUser= await User.find()
    res.status(200).json(allUser)
  }catch(err){
    res.status(500).json(err)
  }


}






export const addUser = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, mobile, location, gender } = req.body;
  
  if (!fname || !lname || !email || !mobile || !gender || !location ||  !file) {
      res.status(401).json("All Inputs is required")
  }

  const preuser = await User.findOne({ email: email });

  if (preuser) return res.status(401).json("User Already Exists");
  const phoneNumber = parseInt(mobile);
  const newUser = new User({
    fname,
    lname,
    email,
    phoneNumber,
    location,
    gender,
    profileImg: file
  });
  try {
    const user=await newUser.save();
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
    let { fname, lname, email, phoneNumber, gender, location } = req.body;
    phoneNumber = parseInt(phoneNumber);
    const file = req.file ? req.file.filename : user_profile
    // const updatedUser = await User.findByIdAndUpdate(id, {
    //   $set: req.body,
    // });
    const updatedUser = await User.findByIdAndUpdate({ _id: id }, {
      fname, lname, email, phoneNumber, gender, location,  profileImg: file
  });

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndRemove(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // return res.status(200).json({ message: "User deleted successfully" });
    const deletuser = await User.findByIdAndDelete({ _id: id });
    res.status(200).json(deletuser);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const exportToCsv = async (req, res) => {

  const users = await User.find();
  

  const csvStream = csv.format({ headers: true });
 

  if (!fs.existsSync("public/files/export/")) {
    console.log('1111')
      if (!fs.existsSync("public/files")) {
        console.log('2222222')
          fs.mkdirSync("public/files/",{ recursive: true });
          console.log('33333333')
      }
      if (!fs.existsSync("public/files/export")) {
          fs.mkdirSync("./public/files/export/");
      }
  }
  const writablestream = fs.createWriteStream(
      "public/files/export/users.csv"
  );
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
              Location: user.location ? user.location : "-"
          })
      })
  }
  csvStream.end();
  writablestream.end();
};
