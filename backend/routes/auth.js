import express from "express"
import { register, login, getCurrentUser, forgotPassword, resetPassword } from "../controllers/authController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authenticateToken, getCurrentUser)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

export default router
