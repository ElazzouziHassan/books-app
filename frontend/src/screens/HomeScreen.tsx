"use client"

import { useState, useEffect } from "react"
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, Alert } from "react-native"
import { Searchbar, Button } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import type { Book } from "../types"
import BookCard from "../components/BookCard"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

export default function HomeScreen({ navigation }) {
  const [books, setBooks] = useState<Book[]>([])
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [borrowingBookId, setBorrowingBookId] = useState<number | null>(null)
  const { token, user } = useAuth()

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.isbn.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setDisplayedBooks(filtered)
    } else {
      setDisplayedBooks(books)
    }
  }, [searchQuery, books])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API_URL}/books/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch books")
      }

      const data = await response.json()
      setBooks(data)
      setDisplayedBooks(data)
    } catch (error) {
      console.error("Error fetching books:", error)
      setError("Failed to load books. Please try again later.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchBooks()
  }

  const handleBorrowBook = async (bookId: number, userId: number | undefined) => {
    // Check if the book belongs to the current user
    if (userId === user?.id) {
      return
    }

    try {
      setBorrowingBookId(bookId)

      const response = await fetch(`${API_URL}/books/${bookId}/borrow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to borrow book")
      }

      // Update book status locally
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
      setDisplayedBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))

      // Show success message
      Alert.alert("Success", "Book borrowed successfully", [
        { text: "View My Books", onPress: () => navigation.navigate("Borrowed") },
        { text: "Continue Browsing", style: "cancel" },
      ])
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to borrow book")
    } finally {
      setBorrowingBookId(null)
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
        <Button
          mode="contained"
          onPress={fetchBooks}
          style={styles.retryButton}
          icon={({ size, color }) => <Ionicons name="refresh" size={size} color={color} />}
        >
          Retry
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="library" size={22} color={colors.white} style={styles.headerIcon} /> Available Books
        </Text>
      </View>

      <Searchbar
        placeholder="Search by title, author or ISBN..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={colors.royalBlue}
        inputStyle={{ color: colors.darkNavy }}
      />

      {displayedBooks.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search" size={64} color={colors.lightGray} style={styles.emptyIcon} />
          <Text style={styles.noResultsText}>
            {searchQuery ? "No books match your search" : "No books available at the moment"}
          </Text>
          {searchQuery && (
            <Button
              mode="outlined"
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
              icon={({ size, color }) => <Ionicons name="close-circle" size={size} color={color} />}
            >
              Clear Search
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={displayedBooks}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
              onBorrow={() => {
                if (item.userId === user?.id) {
                  Alert.alert("Cannot Borrow", "You cannot borrow your own book.")
                  return
                }
                handleBorrowBook(item.id, item.userId)
              }}
              showBorrowButton={true}
              isLoading={borrowingBookId === item.id}
              isOwnedByUser={item.userId === user?.id}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.royalBlue]} />
          }
        />
      )}
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
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 80, // Add extra padding at the bottom
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
  clearButton: {
    marginTop: 16,
    borderColor: colors.royalBlue,
  },
  noResultsText: {
    color: colors.lightBlueGray,
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
  emptyIcon: {
    marginBottom: 16,
  },
})
