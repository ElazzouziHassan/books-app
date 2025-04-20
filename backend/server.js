import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import bookRoutes from "./routes/books.js"
import { authenticateToken } from "./middleware/auth.js"
import { initializeDatabase } from "./config/database.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/books", authenticateToken, bookRoutes)

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err)
    process.exit(1)
  })
