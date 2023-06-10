import express from 'express'
import { getAllUsers , addUser,getUser , editUser , deleteUser  , exportToCsv , paginatedUsers } from '../controller/userController.js'
const router= express.Router()
// import multer from 'multer'
// const storage = multer.memoryStorage()
// const upload = multer({ storage })
import upload from '../multerConfig/storageConfig.js'


router.get('/all-user' ,  getAllUsers)

router.get('/export-user' , exportToCsv )

router.post('/add-user' , upload.single("user_profile") , addUser)

router.put('/edit-user/:id' , upload.single("user_profile") , editUser)

router.delete('/delete-user/:id', deleteUser )

router.get('/paginated-users' , paginatedUsers)

router.get('/:id' , getUser)

export default router