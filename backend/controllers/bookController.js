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

    const [requests] = await pool.query(
      `
      SELECT id, status, request_date as requestDate
      FROM borrow_requests
      WHERE book_id = ? AND requester_id = ? AND status = 'pending'
      LIMIT 1
    `,
      [req.params.id, req.user.id],
    )

    const book = books[0]
    book.requestStatus =
      requests.length > 0
        ? {
            id: requests[0].id,
            status: requests[0].status,
            requestDate: requests[0].requestDate,
          }
        : null

    res.json(book)
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

    const [pendingRequests] = await pool.query(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE book_id = ? AND status = 'pending'",
      [bookId],
    )

    if (pendingRequests[0].count > 0) {
      return res.status(400).json({ message: "Cannot delete a book that has pending borrow requests" })
    }

    await pool.query("DELETE FROM books WHERE id = ?", [bookId])

    res.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Delete book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const requestBorrowBook = async (req, res) => {
  try {
    const bookId = req.params.id
    const userId = req.user.id
    const { message } = req.body || {}

    const [existingBooks] = await pool.query("SELECT * FROM books WHERE id = ?", [bookId])

    if (existingBooks.length === 0) {
      return res.status(404).json({ message: "Book not found" })
    }

    if (existingBooks[0].user_id === userId) {
      return res.status(400).json({ message: "You cannot borrow your own book" })
    }

    if (!existingBooks[0].available) {
      return res.status(400).json({ message: "Book is not available for borrowing" })
    }

    const [existingRequests] = await pool.query(
      "SELECT * FROM borrow_requests WHERE book_id = ? AND requester_id = ? AND status = 'pending'",
      [bookId, userId],
    )

    if (existingRequests.length > 0) {
      return res.status(400).json({ message: "You already have a pending request for this book" })
    }

    const [result] = await pool.query(
      "INSERT INTO borrow_requests (book_id, requester_id, owner_id, message) VALUES (?, ?, ?, ?)",
      [bookId, userId, existingBooks[0].user_id, message || null],
    )

    res.status(201).json({
      message: "Borrow request sent successfully",
      requestId: result.insertId,
    })
  } catch (error) {
    console.error("Request borrow book error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getReceivedBorrowRequests = async (req, res) => {
  try {
    const userId = req.user.id
    const status = req.query.status || "pending" 

    const [requests] = await pool.query(
      `
      SELECT 
        br.id,
        br.book_id as bookId,
        br.requester_id as requesterId,
        br.status,
        br.message,
        br.request_date as requestDate,
        br.response_date as responseDate,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.cover_image as bookCoverImage,
        u.name as requesterName,
        u.email as requesterEmail
      FROM borrow_requests br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.requester_id = u.id
      WHERE br.owner_id = ? AND br.status = ?
      ORDER BY br.request_date DESC
      `,
      [userId, status],
    )

    res.json(requests)
  } catch (error) {
    console.error("Get received borrow requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const getSentBorrowRequests = async (req, res) => {
  try {
    const userId = req.user.id

    const [requests] = await pool.query(
      `
      SELECT 
        br.id,
        br.book_id as bookId,
        br.owner_id as ownerId,
        br.status,
        br.message,
        br.request_date as requestDate,
        br.response_date as responseDate,
        b.title as bookTitle,
        b.author as bookAuthor,
        b.cover_image as bookCoverImage,
        u.name as ownerName
      FROM borrow_requests br
      JOIN books b ON br.book_id = b.id
      JOIN users u ON br.owner_id = u.id
      WHERE br.requester_id = ?
      ORDER BY br.request_date DESC
      `,
      [userId],
    )

    res.json(requests)
  } catch (error) {
    console.error("Get sent borrow requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const respondToBorrowRequest = async (req, res) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id
    const { status } = req.body

    if (status !== "accepted" && status !== "rejected") {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" })
    }

    const [requests] = await pool.query(
      `
      SELECT br.*, b.available
      FROM borrow_requests br
      JOIN books b ON br.book_id = b.id
      WHERE br.id = ? AND br.owner_id = ? AND br.status = 'pending'
      `,
      [requestId, userId],
    )

    if (requests.length === 0) {
      return res.status(404).json({ message: "Borrow request not found or already processed" })
    }

    const request = requests[0]

    if (status === "accepted" && !request.available) {
      return res.status(400).json({ message: "Book is no longer available for borrowing" })
    }

    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      await connection.query("UPDATE borrow_requests SET status = ?, response_date = CURRENT_TIMESTAMP WHERE id = ?", [
        status,
        requestId,
      ])

      if (status === "accepted") {
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 14)

        await connection.query(
          "INSERT INTO borrowed_books (user_id, book_id, request_id, due_date) VALUES (?, ?, ?, ?)",
          [request.requester_id, request.book_id, requestId, dueDate],
        )

        await connection.query("UPDATE books SET available = FALSE WHERE id = ?", [request.book_id])

        const [otherRequests] = await connection.query(
          "SELECT id FROM borrow_requests WHERE book_id = ? AND id != ? AND status = 'pending'",
          [request.book_id, requestId],
        )

        if (otherRequests.length > 0) {
          console.log(`Rejecting ${otherRequests.length} other pending requests for book ${request.book_id}`)

          await connection.query(
            `UPDATE borrow_requests 
            SET status = 'rejected', response_date = CURRENT_TIMESTAMP 
            WHERE book_id = ? AND id != ? AND status = 'pending'`,
            [request.book_id, requestId],
          )
        }
      }

      await connection.commit()

      res.json({
        message: `Borrow request ${status === "accepted" ? "accepted" : "rejected"} successfully`,
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error("Respond to borrow request error:", error)
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
        bb.request_id as requestId,
        b.id as bookId, 
        b.title, 
        b.author, 
        b.isbn, 
        b.published_year as publishedYear, 
        b.description,
        ${coverImageColumn}
        b.user_id as userId,
        u.name as ownerName
      FROM borrowed_books bb
      JOIN books b ON bb.book_id = b.id
      JOIN users u ON b.user_id = u.id
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
      requestId: book.requestId,
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
      owner: {
        name: book.ownerName,
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
      "b.id",
      "b.title",
      "b.author",
      "b.isbn",
      "b.published_year as publishedYear",
      "b.description",
      "b.available",
      "b.user_id as userId",
      "b.created_at as createdAt",
      "b.updated_at as updatedAt",
    ]

    try {
      await pool.query("SELECT cover_image FROM books LIMIT 1")
      columns.push("b.cover_image as coverImage")
    } catch (error) {
      console.log("cover_image column doesn't exist, skipping it in the query")
    }

    const [books] = await pool.query(`
      SELECT ${columns.join(", ")}, u.name as ownerName
      FROM books b
      JOIN users u ON b.user_id = u.id
      WHERE b.available = TRUE
      ORDER BY b.title ASC
    `)

    const userId = req.user.id
    const [requests] = await pool.query(
      `
      SELECT book_id, id, request_date
      FROM borrow_requests
      WHERE requester_id = ? AND status = 'pending'
      `,
      [userId],
    )

    const requestMap = {}
    requests.forEach((req) => {
      requestMap[req.book_id] = {
        id: req.id,
        status: "pending",
        requestDate: req.request_date,
      }
    })

    const booksWithRequestStatus = books.map((book) => ({
      ...book,
      requestStatus: requestMap[book.id] || null,
    }))

    res.json(booksWithRequestStatus)
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

    const [pendingRequests] = await pool.query(
      "SELECT COUNT(*) as count FROM borrow_requests WHERE owner_id = ? AND status = 'pending'",
      [userId],
    )

    res.json({
      ownedBooks: ownedBooks[0].count,
      borrowedBooks: borrowedBooks[0].count,
      pendingRequests: pendingRequests[0].count,
    })
  } catch (error) {
    console.error("Get user stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

export const cancelBorrowRequest = async (req, res) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const [requests] = await pool.query(
      "SELECT * FROM borrow_requests WHERE id = ? AND requester_id = ? AND status = 'pending'",
      [requestId, userId],
    )

    if (requests.length === 0) {
      return res.status(404).json({ message: "Borrow request not found or already processed" })
    }

    await pool.query("DELETE FROM borrow_requests WHERE id = ?", [requestId])

    res.json({ message: "Borrow request cancelled successfully" })
  } catch (error) {
    console.error("Cancel borrow request error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
