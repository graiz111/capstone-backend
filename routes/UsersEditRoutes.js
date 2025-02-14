import express, { Router } from 'express'
import { checkRoleMiddleware, getUserByRole, UserEditDetails } from '../controllers/UserEditDetails.js'
import { processUpload } from '../utils/cloudinary.js'
const router = express.Router()

router.get('/getprofile/:role/:id',checkRoleMiddleware,getUserByRole)
router.put('/editprofile/:role/:id',checkRoleMiddleware,processUpload,UserEditDetails)


export  {router as UsersEditRoutes};