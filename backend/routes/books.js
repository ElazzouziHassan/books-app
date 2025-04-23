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

router.use(authenticateToken)

router.get("/", getAllBooks)
router.get("/available", getAvailableBooks)
router.get("/borrowed", getBorrowedBooks)
router.get("/user", getUserBooks)
router.get("/user/stats", getUserStats)
router.get("/:id", getBookById)
router.post("/", createBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)
router.post("/:id/borrow", borrowBook)
router.post("/:id/return", returnBook)

export default router
