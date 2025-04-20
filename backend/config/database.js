import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lib_db",
}

const pool = mysql.createPool(dbConfig)

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255) NULL,
        reset_token_expiry DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(50) NOT NULL UNIQUE,
        published_year INT NOT NULL,
        description TEXT,
        cover_image TEXT,
        available BOOLEAN DEFAULT TRUE,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    try {
      await pool.query(`
        SELECT cover_image FROM books LIMIT 1
      `)
    } catch (error) {
      if (error.code === "ER_BAD_FIELD_ERROR") {
        console.log("Adding missing cover_image column to books table")
        await pool.query(`
          ALTER TABLE books ADD COLUMN cover_image TEXT AFTER description
        `)
      }
    }

    try {
      await pool.query(`
        SELECT reset_token FROM users LIMIT 1
      `)
    } catch (error) {
      if (error.code === "ER_BAD_FIELD_ERROR") {
        console.log("Adding missing reset_token columns to users table")
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN reset_token VARCHAR(255) NULL AFTER password,
          ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token
        `)
      }
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS borrowed_books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME NOT NULL,
        returned_at DATETIME NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `)

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

export default pool
