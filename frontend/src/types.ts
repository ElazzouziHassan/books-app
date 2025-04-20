export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  publishedYear: number
  description?: string
  available: boolean
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export interface BorrowedBook {
  id: number
  book: Book
  borrowedAt: string
  dueDate: string
  returnedAt: string | null
}

export interface User {
  id: number
  name: string
  email: string
}
