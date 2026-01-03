import express from "express"
import { register, login, getMe } from "../controllers/auth.controller.js"
import { verifyJWT } from "../middlewares/verifyJWT.js"

const router = express.Router()

router.post("/register", register)

router.post("/login", login)

// Protected route to get current user information
router.get("/me", verifyJWT, getMe)

export default router
