"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native"
import { Card, Title, Paragraph, Button, Text, Divider } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import type { Book } from "../types"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

export default function BookDetailsScreen({ route, navigation }) {
  const { bookId } = route.params
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const { token, user } = useAuth()

  useEffect(() => {
    fetchBookDetails()
  }, [bookId])

  const fetchBookDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch book details")
      }

      const data = await response.json()
      setBook(data)
    } catch (error) {
      alert("Failed to load book details")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBorrowBook = async () => {
    // Check if the book belongs to the current user
    if (book?.userId === user?.id) {
      alert("You cannot borrow your own book")
      return
    }

    try {
      setBorrowing(true)
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

      alert("Book borrowed successfully")
      fetchBookDetails() // Refresh book details
      navigation.navigate("Borrowed") // Navigate to borrowed books
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to borrow book")
    } finally {
      setBorrowing(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.royalBlue} />
      </View>
    )
  }

  if (!book) {
    return (
      <View style={styles.centered}>
        <Text>Book not found</Text>
      </View>
    )
  }

  const placeholderImage = "https://via.placeholder.com/300x450/9FB3DF/123458?text=No+Cover"
  const isOwnedByUser = book.userId === user?.id

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.coverContainer}>
            <Image source={{ uri: book.coverImage || placeholderImage }} style={styles.coverImage} resizeMode="cover" />
            {isOwnedByUser && (
              <View style={styles.ownerBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
            )}
          </View>

          <View style={styles.headerInfo}>
            <Title style={styles.title}>{book.title}</Title>
            <Paragraph style={styles.author}>by {book.author}</Paragraph>

            <View style={styles.statusContainer}>
              <Ionicons
                name={book.available ? "checkmark-circle" : "close-circle"}
                size={18}
                color={book.available ? colors.success : colors.error}
                style={styles.statusIcon}
              />
              <Text style={[styles.statusText, book.available ? styles.availableText : styles.unavailableText]}>
                {book.available ? "Available" : "Not Available"}
              </Text>
            </View>

            {isOwnedByUser && (
              <View style={styles.ownerContainer}>
                <Ionicons name="person" size={18} color={colors.royalBlue} style={styles.statusIcon} />
                <Text style={styles.ownerText}>This is your book</Text>
              </View>
            )}
          </View>
        </View>

        <Divider style={styles.divider} />

        <Card.Content>
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>ISBN:</Text>
              <Text style={styles.value}>{book.isbn}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Published:</Text>
              <Text style={styles.value}>{book.publishedYear}</Text>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.descriptionTitle}>Description</Text>
            <Paragraph style={styles.description}>{book.description || "No description available."}</Paragraph>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          {book.available && !isOwnedByUser ? (
            <Button
              mode="contained"
              style={styles.borrowButton}
              labelStyle={styles.buttonLabel}
              onPress={handleBorrowBook}
              loading={borrowing}
              disabled={borrowing}
              icon={({ size, color }) => <Ionicons name="bookmark-outline" size={size} color={color} />}
            >
              Borrow This Book
            </Button>
          ) : isOwnedByUser ? (
            <Button
              mode="outlined"
              style={styles.editButton}
              labelStyle={styles.editButtonLabel}
              onPress={() => navigation.navigate("Manage", { screen: "AddEditBook", params: { book } })}
              icon={({ size, color }) => <Ionicons name="create-outline" size={size} color={color} />}
            >
              Edit Book Details
            </Button>
          ) : (
            <Button
              mode="outlined"
              style={styles.unavailableButton}
              labelStyle={styles.unavailableButtonLabel}
              disabled
              icon={({ size, color }) => <Ionicons name="close-circle-outline" size={size} color={color} />}
            >
              Currently Unavailable
            </Button>
          )}
        </Card.Actions>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.lightPeriwinkle,
  },
  coverContainer: {
    marginRight: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.lightPeriwinkle,
  },
  ownerBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: colors.darkNavy,
    marginBottom: 12,
  },
  statusContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  availableText: {
    backgroundColor: colors.success,
    color: colors.white,
  },
  unavailableText: {
    backgroundColor: colors.error,
    color: colors.white,
  },
  ownerContainer: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  ownerText: {
    fontSize: 14,
    color: colors.royalBlue,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginVertical: 16,
  },
  detailsContainer: {
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkNavy,
    width: 100,
  },
  value: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
  },
  actions: {
    justifyContent: "center",
    padding: 16,
  },
  borrowButton: {
    width: "100%",
    paddingVertical: 8,
    backgroundColor: colors.royalBlue,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  unavailableButton: {
    width: "100%",
    paddingVertical: 8,
    borderColor: colors.lightGray,
  },
  unavailableButtonLabel: {
    color: colors.lightGray,
  },
  editButton: {
    width: "100%",
    paddingVertical: 8,
    borderColor: colors.lavender,
  },
  editButtonLabel: {
    color: colors.lavender,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
