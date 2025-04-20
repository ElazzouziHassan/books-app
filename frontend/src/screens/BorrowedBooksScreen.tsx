"use client"

import { useState, useEffect } from "react"
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, Alert } from "react-native"
import { Button } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import type { BorrowedBook } from "../types"
import BookCard from "../components/BookCard"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

export default function BorrowedBooksScreen({ navigation }) {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [returning, setReturning] = useState<number | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBorrowedBooks()
    })

    return unsubscribe
  }, [navigation])

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/books/borrowed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch borrowed books")
      }

      setBorrowedBooks(data)
    } catch (error) {
      console.error("Failed to load borrowed books:", error)
      setError("Failed to load borrowed books. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchBorrowedBooks()
  }

  const handleReturnBook = async (bookId: number) => {
    try {
      setReturning(bookId)
      const response = await fetch(`${API_URL}/books/${bookId}/return`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to return book")
      }

      Alert.alert("Success", "Book returned successfully")

      // Remove the book from the borrowed list
      setBorrowedBooks((prevBooks) => prevBooks.filter((item) => item.book.id !== bookId))
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to return book")
    } finally {
      setReturning(null)
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.royalBlue} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchBorrowedBooks} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    )
  }

  if (borrowedBooks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Borrowed Books</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>No Borrowed Books</Text>
          <Text style={styles.emptyMessage}>
            You haven't borrowed any books yet. Browse the catalog to find books to borrow.
          </Text>
          <Button mode="contained" style={styles.browseButton} onPress={() => navigation.navigate("Home")}>
            Browse Books
          </Button>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Borrowed Books</Text>
      </View>

      <FlatList
        data={borrowedBooks}
        renderItem={({ item }) => (
          <BookCard
            book={item.book}
            onPress={() => navigation.navigate("BookDetails", { bookId: item.book.id })}
            onReturn={() => handleReturnBook(item.book.id)}
            showReturnButton={true}
            borrowedDate={item.borrowedAt}
            dueDate={item.dueDate}
            isLoading={returning === item.book.id}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.royalBlue]} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.darkNavy,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.royalBlue,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.lightBlueGray,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.royalBlue,
    paddingHorizontal: 20,
  },
})
