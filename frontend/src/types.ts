export interface Book {
  id: number
  title: string
  author: string
  isbn: string
  publishedYear: number
  description?: string
  available: boolean
  coverImage?: string
  userId: number
  ownerName?: string
  createdAt: string
  updatedAt: string
  requestStatus?: RequestStatus | null
}
export interface RequestStatus {
  id: number
  status: "pending" | "accepted" | "rejected"
  requestDate: string
}
export interface BorrowRequest {
  id: number
  bookId: number
  requesterId: number
  ownerId: number
  status: "pending" | "accepted" | "rejected"
  message?: string
  requestDate: string
  responseDate?: string
  bookTitle: string
  bookAuthor: string
  bookCoverImage?: string
  requesterName?: string
  requesterEmail?: string
  ownerName?: string
}
export interface BorrowedBook {
  id: number
  book: Book
  borrowedAt: string
  dueDate: string
  returnedAt: string | null
  requestId?: number
  owner?: {
    name: string
  }
}
export interface User {
  id: number
  name: string
  email: string
}
export interface UserStats {
  ownedBooks: number
  borrowedBooks: number
  pendingRequests: number
}
