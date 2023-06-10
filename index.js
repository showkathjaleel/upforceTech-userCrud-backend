import express from "express"
import bodyParser from "body-parser"
import cors from "cors";
import mongoose from "mongoose";
import userRoute from './routes/user.js'
import * as dotenv from "dotenv"
dotenv.config()
// console.log(process.env.MONGO_URL)

async function connectToDatabase() {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log('connected to MongoDB')
    }catch(err){
        console.log(err,'err in mongodb connection')
    }
}
connectToDatabase()

const app=express()
app.use(bodyParser.json())
app.use(cors())
app.use('/user', userRoute)
app.use("/uploads",express.static("./uploads"));
app.use("/files",express.static("./public/files"));

app.listen(8080, () => {
    console.log('server is running')
})