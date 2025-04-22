"use client"

import { useState, useEffect } from "react"
import { View, FlatList, StyleSheet, ActivityIndicator, Text, RefreshControl, Alert } from "react-native"
import { Button, FAB, Searchbar } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import type { Book } from "../types"
import BookCard from "../components/BookCard"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

export default function ManageBooksScreen({ navigation }) {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { token, user } = useAuth()

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
      const response = await fetch(`${API_URL}/books/user`, {
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
      Alert.alert("Error", "Failed to load books")
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchBooks()
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

      Alert.alert("Success", "Book deleted successfully")

      // Remove the book from the list
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
      setFilteredBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId))
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to delete book")
    } finally {
      setDeleting(null)
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.royalBlue} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="settings" size={22} color={colors.white} style={styles.headerIcon} /> Manage My Books
        </Text>
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
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>No Books Added Yet</Text>
          <Text style={styles.emptyMessage}>
            You haven't added any books yet. Add your first book by clicking the + button below.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={({ item }) => (
            <View style={styles.bookCardContainer}>
              <BookCard
                book={item}
                onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
                isOwnedByUser={true}
              />
              <View style={styles.actionButtons}>
                <Button
                  mode="contained"
                  style={styles.editButton}
                  icon={({ size, color }) => <Ionicons name="create-outline" size={size} color={color} />}
                  onPress={() => navigation.navigate("AddEditBook", { book: item })}
                >
                  Edit
                </Button>
                <Button
                  mode="contained"
                  style={styles.deleteButton}
                  icon={({ size, color }) => <Ionicons name="trash-outline" size={size} color={color} />}
                  loading={deleting === item.id}
                  disabled={deleting === item.id || !item.available}
                  onPress={() => {
                    if (!item.available) {
                      Alert.alert("Cannot Delete", "Cannot delete a book that is currently borrowed")
                      return
                    }

                    Alert.alert("Confirm Delete", `Are you sure you want to delete "${item.title}"?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => handleDeleteBook(item.id) },
                    ])
                  }}
                >
                  Delete
                </Button>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.royalBlue]} />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon={({ size, color }) => <Ionicons name="add" size={size} color={color} />}
        color={colors.white}
        onPress={() => navigation.navigate("AddEditBook")}
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
    paddingBottom: 80, // Extra padding for FAB
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
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.royalBlue,
  },
})
