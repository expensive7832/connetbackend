import express from "express"
import protect from "../Middleware/protect.js"
import { likeProfile, showUserByProximity } from "../controller/Match.js"




const router = express.Router()

router.get("/showuserbyproximity", protect, showUserByProximity)
router.get("/like", protect, likeProfile)


export default router