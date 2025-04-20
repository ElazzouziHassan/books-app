import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import pool from "../config/database.js"
import dotenv from "dotenv"
import crypto from "crypto"
import nodemailer from "nodemailer"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || "jwt_token"
const EMAIL_USER = process.env.EMAIL_USER || "your_email@gmail.com"
const EMAIL_PASS = process.env.EMAIL_PASS || "your_email_password"
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com"
const EMAIL_PORT = process.env.EMAIL_PORT || 587
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const [result] = await pool.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const user = users[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [req.user.id])

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(users[0])
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(404).json({ message: "User with this email does not exist" })
    }

    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    await pool.query("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?", [
      resetToken,
      resetTokenExpiry,
      email,
    ])

    const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    }

    await transporter.sendMail(mailOptions)

    res.json({ message: "Password reset email sent" })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" })
    }

    const [users] = await pool.query("SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?", [
      token,
      new Date(),
    ])

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await pool.query("UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?", [
      hashedPassword,
      users[0].id,
    ])

    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
