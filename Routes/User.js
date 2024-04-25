import express  from "express";
import {register, login, fetchUser, updateimg, updateUser, deletepic, fetchUserById} from "../controller/User.js";
import protect from "../Middleware/protect.js";

const router = express.Router()



router.post("/register", register)
router.post("/login", login)
router.get("/user", protect, fetchUser)
router.get("/user/:id", fetchUserById)
router.post("/morepics", protect, updateimg)
router.patch("/update/:id", updateUser)
router.delete("/deletepic", deletepic)


export default router