import pool from "../config/database.js"

export const getAllBooks = async (req, res) => {
  try {
    const columns = [
      "id",
      "title",
      "author",
      "isbn",
      "published_year as publishedYear",
      "description",
      "available",
      "user_id as userId",
      "created_at as createdAt",
      "updated_at as updatedAt",
    ]

    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [books] = await pool.query(`
      SELECT ${columns.join(", ")}
      FROM books
      ORDER BY title ASC
    `)

    res.json(books)
  } catch (error) {
    console.error("Get all books error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getBookById = async (req, res) => {
  try {
    const columns = [
      "id",
      "title",
      "author",
      "isbn",
      "published_year as publishedYear",
      "description",
      "available",
      "user_id as userId",
      "created_at as createdAt",
      "updated_at as updatedAt",
    ]

    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [books] = await pool.query(
      `
      SELECT ${columns.join(", ")}
      FROM books
      WHERE id = ?
    `,
      [req.params.id],
    )

    if (books.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    res.json(books[0])
  } catch (error) {
    console.error("Get book by ID error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getUserBooks = async (req, res) => {
  try {
    const userId = req.user.id

    const columns = [
      "id",
      "title",
      "author",
      "isbn",
      "published_year as publishedYear",
      "description",
      "available",
      "user_id as userId",
      "created_at as createdAt",
      "updated_at as updatedAt",
    ]

    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [books] = await pool.query(
      `
      SELECT ${columns.join(", ")}
      FROM books
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
      [userId],
    )

    res.json(books)
  } catch (error) {
    console.error("Get user books error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const createBook = async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, description, coverImage } = req.body
    const userId = req.user.id

    if (!title || !author || !isbn || !publishedYear) {
      return res.status(400).json({ message: "Title, author, ISBN, and published year are required" })
    }

    const [existingBooks] = await pool.query("SELECT * FROM books WHERE isbn = ?", [isbn])

    if (existingBooks.length > 0) {
      return res.status(400).json({ message: "Book with this ISBN already exists" })
    }

    const [result] = await pool.query(
      "INSERT INTO books (title, author, isbn, published_year, description, cover_image, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, author, isbn, publishedYear, description || null, coverImage || null, userId],
    )

    const columns = [
      "id",
      "title",
      "author",
      "isbn",
      "published_year as publishedYear",
      "description",
      "available",
      "user_id as userId",
      "created_at as createdAt",
      "updated_at as updatedAt",
    ]

    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [newBook] = await pool.query(
      `
      SELECT ${columns.join(", ")}
      FROM books
      WHERE id = ?
    `,
      [result.insertId],
    )

    if (newBook.length === 0) {
      return res.status(404).json({ message: "Failed to retrieve created book" })
    }

    res.status(201).json(newBook[0])
  } catch (error) {
    console.error("Create book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const updateBook = async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, description, coverImage } = req.body
    const bookId = req.params.id
    const userId = req.user.id

    if (!title || !author || !isbn || !publishedYear) {
      return res.status(400).json({ message: "Title, author, ISBN, and published year are required" })
    }

    const [existingBooks] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId])

    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    if (existingBooks[0].user_id !== userId) {
      return res.status(403).json({ message: "You can only update books that you added" })
    }

    if (!existingBooks[0].available) {
      return res.status(400).json({ message: "Cannot update a book that is currently borrowed" })
    }

    const [isbnBooks] = await pool.query("SELECT * FROM books WHERE isbn = ? AND id != ?", [isbn, bookId])

    if (isbnBooks.length > 0) {
      return res.status(400).json({ message: "Another book with this ISBN already exists" })
    }


    await pool.query(
      "UPDATE books SET title = ?, author = ?, isbn = ?, published_year = ?, description = ?, cover_image = ? WHERE id = ?",
      [title, author, isbn, publishedYear, description || null, coverImage || null, bookId],
    )

    const columns = [
      "id",
      "title",
      "author",
      "isbn",
      "published_year as publishedYear",
      "description",
      "available",
      "user_id as userId",
      "created_at as createdAt",
      "updated_at as updatedAt",
    ]


    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [updatedBook] = await pool.query(
      `
      SELECT ${columns.join(", ")}
      FROM books
      WHERE id = ?
    `,
      [bookId],
    )

    if (updatedBook.length === 0) {
      return res.status(404).json({ message: "Failed to retrieve updated book" })
    }

    res.json(updatedBook[0])
  } catch (error) {
    console.error("Update book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


export const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user.id

    const [existingBooks] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId])

    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    if (existingBooks[0].user_id !== userId) {
      return res.status(403).json({ message: "You can only delete books that you added" })
    }


    if (!existingBooks[0].available) {
      return res.status(400).json({ message: "Cannot delete a book that is currently borrowed" })
    }


    await pool.query("DELETE FROM books WHERE id = ?", [bookId])

    res.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Delete book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


export const borrowBook = async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user.id

    const [existingBooks] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId])

    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    if (!existingBooks[0].available) {
      return res.status(400).json({ message: "Book is not available for borrowing" })
    }

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      await connection.query("INSERT INTO borrowed_books (user_id, book_id, due_date) VALUES (?, ?, ?)", [
        userId,
        bookId,
        dueDate,
      ])

      await connection.query("UPDATE books SET available = FALSE WHERE id = ?", [bookId])

      await connection.commit()

      res.json({
        message: "Book borrowed successfully",
        dueDate: dueDate.toISOString(),
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Borrow book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const returnBook = async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user.id

    const [existingBooks] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId])

    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    const [borrowedBooks] = await pool.query(
      "SELECT * FROM borrowed_books WHERE book_id = ? AND user_id = ? AND returned_at IS NULL",
      [bookId, userId],
    )

    if (borrowedBooks.length === 0) {
      return res.status(400).json({ message: "You have not borrowed this book" })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      await connection.query("UPDATE borrowed_books SET returned_at = CURRENT_TIMESTAMP WHERE id = ?", [
        borrowedBooks[0].id,
      ])

      await connection.query("UPDATE books SET available = TRUE WHERE id = ?", [bookId])

      await connection.commit()

      res.json({ message: "Book returned successfully" })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Return book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getBorrowedBooks = async (req, res) => {
  try {
    const userId = req.user.id

    let coverImageColumn = ""
    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      coverImageColumn = "b.cover_image as coverImage,"
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [borrowedBooks] = await pool.query(
      `
      SELECT 
        bb.id, 
        bb.borrowed_at as borrowedAt, 
        bb.due_date as dueDate, 
        bb.returned_at as returnedAt,
        b.id as bookId, 
        b.title, 
        b.author, 
        b.isbn, 
        b.published_year as publishedYear, 
        b.description,
        ${coverImageColumn}
        b.user_id as userId
      FROM borrowed_books bb
      JOIN books b ON bb.book_id = b.id
      WHERE bb.user_id = ? AND bb.returned_at IS NULL
      ORDER BY bb.borrowed_at DESC
    `,
      [userId],
    )

    const formattedBooks = borrowedBooks.map((book) => ({
      id: book.id,
      borrowedAt: book.borrowedAt,
      dueDate: book.dueDate,
      returnedAt: book.returnedAt,
      book: {
        id: book.bookId,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedYear: book.publishedYear,
        description: book.description,
        coverImage: book.coverImage,
        available: false,
        userId: book.userId,
      },
    }))

    res.json(formattedBooks)
  } catch (error) {
    console.error("Get borrowed books error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getAvailableBooks = async (req, res) => {
  try {
    const columns = [
      "id",
      "title",
      "author",
      "isbn",
      "published_year as publishedYear",
      "description",
      "available",
      "user_id as userId",
      "created_at as createdAt",
      "updated_at as updatedAt",
    ]

    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [books] = await pool.query(`
      SELECT ${columns.join(", ")}
      FROM books
      WHERE available = TRUE
      ORDER BY title ASC
    `)

    res.json(books)
  } catch (error) {
    console.error("Get available books error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id

    const [ownedBooks] = await pool.query("SELECT COUNT(*) as count FROM books WHERE user_id = ?", [userId])

    const [borrowedBooks] = await pool.query(
      "SELECT COUNT(*) as count FROM borrowed_books WHERE user_id = ? AND returned_at IS NULL",
      [userId],
    )

    res.json({
      ownedBooks: ownedBooks[0].count,
      borrowedBooks: borrowedBooks[0].count,
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
