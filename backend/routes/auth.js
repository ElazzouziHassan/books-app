import express from "express"
import { register, login, getCurrentUser, forgotPassword, resetPassword } from "../controllers/authController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Register a new user
router.post("/register", register)

// Login user
router.post("/login", login)

// Get current user
router.get("/me", authenticateToken, getCurrentUser)

// Forgot password
router.post("/forgot-password", forgotPassword)

// Reset password
router.post("/reset-password", resetPassword)

export default router
