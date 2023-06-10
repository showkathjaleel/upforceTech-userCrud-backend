import mongoose from "mongoose"
const UserSchema =new mongoose.Schema({
    fname: {
       type: String ,
       required : true
    },
    lname: {
        type: String ,
        
     },
    email : {
        type : String , 
        required : true ,
        unique : true
    },
    phoneNumber: {
        type : Number , 
        required: true
    },
    profileImg: {
        type : String ,
    },
    location : {
        type : String
    },
    gender: {
        type: String,
        required: true
    }

})



const User= mongoose.model('User' , UserSchema)
export default User;


// import mongoose from "mongoose";
// const UserSchema = new mongoose.Schema({
//     username:{
//         type:String, 
//         required: true
//     },
//      email:{
//         type : String ,
//         required : true ,
//         unique :  true , 
//     },
//     password : {
//         type : String,
//         required : true 
//     }
// })

// const User= mongoose.model('User', UserSchema )

// export default User;