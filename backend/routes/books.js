import express from "express"
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  requestBorrowBook,
  returnBook,
  getBorrowedBooks,
  getUserBooks,
  getAvailableBooks,
  getUserStats,
  getReceivedBorrowRequests,
  getSentBorrowRequests,
  respondToBorrowRequest,
  cancelBorrowRequest,
} from "../controllers/bookController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.use(authenticateToken)
router.get("/", getAllBooks)
router.get("/available", getAvailableBooks)
router.get("/borrowed", getBorrowedBooks)
router.get("/user", getUserBooks)
router.get("/user/stats", getUserStats)
router.get("/requests/received", getReceivedBorrowRequests)
router.get("/requests/sent", getSentBorrowRequests)
router.post("/requests/:id/respond", respondToBorrowRequest)
router.delete("/requests/:id", cancelBorrowRequest)
router.get("/:id", getBookById)
router.post("/", createBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)
router.post("/:id/request", requestBorrowBook)
router.post("/:id/return", returnBook)

export default router
