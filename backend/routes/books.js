import express from "express"
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getBorrowedBooks,
  getUserBooks,
  getAvailableBooks,
  getUserStats,
} from "../controllers/bookController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// Get all books
router.get("/", getAllBooks)

// Get available books
router.get("/available", getAvailableBooks)

// Get user's borrowed books
router.get("/borrowed", getBorrowedBooks)

// Get books added by the current user
router.get("/user", getUserBooks)

// Get user stats
router.get("/user/stats", getUserStats)

// Get book by ID
router.get("/:id", getBookById)

// Create a new book
router.post("/", createBook)

// Update a book
router.put("/:id", updateBook)

// Delete a book
router.delete("/:id", deleteBook)

// Borrow a book
router.post("/:id/borrow", borrowBook)

// Return a book
router.post("/:id/return", returnBook)

export default router
