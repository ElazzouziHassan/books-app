"use client"

import { useState, useEffect } from "react"
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from "react-native"
import { Button, FAB, Searchbar } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import type { Book } from "../types"
import BookCard from "../components/BookCard"
import { colors } from "../theme/colors"

export default function ManageBooksScreen({ navigation }) {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { token } = useAuth()

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBooks()
    })

    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (searchQuery) {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.isbn.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBooks(filtered)
    } else {
      setFilteredBooks(books)
    }
  }, [searchQuery, books])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch books")
      }

      const data = await response.json()
      setBooks(data)
      setFilteredBooks(data)
    } catch (error) {
      alert("Failed to load books")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async (bookId: number) => {
    try {
      setDeleting(bookId)
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to delete book")
      }

      alert("Book deleted successfully")

      // Remove the book from the list
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
      setFilteredBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete book")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.royalBlue} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Books</Text>
      </View>

      <Searchbar
        placeholder="Search books..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={colors.royalBlue}
        inputStyle={{ color: colors.darkNavy }}
      />

      {filteredBooks.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noResultsText}>No books found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={({ item }) => (
            <View style={styles.bookCardContainer}>
              <BookCard book={item} onPress={() => navigation.navigate("AddEditBook", { book: item })} />
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  style={styles.editButton}
                  onPress={() => navigation.navigate("AddEditBook", { book: item })}
                >
                  Edit
                </Button>
                <Button
                  mode="contained"
                  style={styles.deleteButton}
                  loading={deleting === item.id}
                  disabled={deleting === item.id || !item.available}
                  onPress={() => {
                    if (!item.available) {
                      alert("Cannot delete a book that is currently borrowed")
                      return
                    }

                    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                      handleDeleteBook(item.id)
                    }
                  }}
                >
                  Delete
                </Button>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB style={styles.fab} icon="plus" color={colors.white} onPress={() => navigation.navigate("AddEditBook")} />
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
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: colors.white,
    borderRadius: 8,
  },
  list: {
    padding: 16,
  },
  bookCardContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  editButton: {
    marginRight: 12,
    backgroundColor: colors.lavender,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    color: colors.lightBlueGray,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.royalBlue,
  },
})
