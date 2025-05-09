"use client"

import { useState, useEffect } from "react"
import { StyleSheet, ScrollView, Alert, View, Image } from "react-native"
import { TextInput, Button, Text } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

export default function AddEditBookScreen({ route, navigation }) {
  const book = route.params?.book
  const isEditing = !!book

  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [isbn, setIsbn] = useState("")
  const [publishedYear, setPublishedYear] = useState("")
  const [description, setDescription] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  const { token } = useAuth()

  useEffect(() => {
    if (isEditing) {
      setTitle(book.title)
      setAuthor(book.author)
      setIsbn(book.isbn)
      setPublishedYear(book.publishedYear.toString())
      setDescription(book.description || "")
      setCoverImage(book.coverImage || "")
      if (book.coverImage) {
        setShowImagePreview(true)
      }
    }
  }, [isEditing, book])

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required")
      return false
    }
    if (!author.trim()) {
      Alert.alert("Error", "Author is required")
      return false
    }
    if (!isbn.trim()) {
      Alert.alert("Error", "ISBN is required")
      return false
    }
    if (!publishedYear.trim() || isNaN(Number(publishedYear))) {
      Alert.alert("Error", "Published year must be a valid number")
      return false
    }
    return true
  }

  const handleSaveBook = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const bookData = {
        title,
        author,
        isbn,
        publishedYear: Number(publishedYear),
        description,
        coverImage,
      }

      const url = isEditing ? `${API_URL}/books/${book.id}` : `${API_URL}/books`

      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? "update" : "create"} book`)
      }

      Alert.alert("Success", `Book ${isEditing ? "updated" : "created"} successfully`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ])
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : `Failed to ${isEditing ? "update" : "create"} book`)
    } finally {
      setLoading(false)
    }
  }

  const placeholderImage = "https://via.placeholder.com/150x200/9FB3DF/123458?text=No+Cover"

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons
            name={isEditing ? "create" : "add-circle"}
            size={22}
            color={colors.white}
            style={styles.headerIcon}
          />
          {isEditing ? "Edit Book" : "Add New Book"}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.coverPreview}>
          <Image source={{ uri: coverImage || placeholderImage }} style={styles.coverImage} resizeMode="cover" />
          <Text style={styles.coverLabel}>Cover Preview</Text>
        </View>

        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          mode="outlined"
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
          left={<TextInput.Icon icon={({ size, color }) => <Ionicons name="book" size={size} color={color} />} />}
        />

        <TextInput
          label="Author"
          value={author}
          onChangeText={setAuthor}
          style={styles.input}
          mode="outlined"
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
          left={<TextInput.Icon icon={({ size, color }) => <Ionicons name="person" size={size} color={color} />} />}
        />

        <TextInput
          label="ISBN"
          value={isbn}
          onChangeText={setIsbn}
          style={styles.input}
          mode="outlined"
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
          left={<TextInput.Icon icon={({ size, color }) => <Ionicons name="barcode" size={size} color={color} />} />}
        />

        <TextInput
          label="Published Year"
          value={publishedYear}
          onChangeText={setPublishedYear}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
          left={<TextInput.Icon icon={({ size, color }) => <Ionicons name="calendar" size={size} color={color} />} />}
        />

        <TextInput
          label="Cover Image URL (optional)"
          value={coverImage}
          onChangeText={setCoverImage}
          style={styles.input}
          mode="outlined"
          placeholder="https://example.com/book-cover.jpg"
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
          left={<TextInput.Icon icon={({ size, color }) => <Ionicons name="image" size={size} color={color} />} />}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.textArea}
          mode="outlined"
          multiline
          numberOfLines={6}
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
          left={
            <TextInput.Icon icon={({ size, color }) => <Ionicons name="document-text" size={size} color={color} />} />
          }
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            icon={({ size, color }) => <Ionicons name="close" size={size} color={color} />}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleSaveBook}
            style={styles.saveButton}
            loading={loading}
            disabled={loading}
            icon={({ size, color }) => <Ionicons name="save" size={size} color={color} />}
          >
            {isEditing ? "Update Book" : "Add Book"}
          </Button>
        </View>
      </View>
    </ScrollView>
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
  formContainer: {
    padding: 16,
  },
  coverPreview: {
    alignItems: "center",
    marginBottom: 20,
  },
  coverImage: {
    width: 150,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.lightPeriwinkle,
  },
  coverLabel: {
    color: colors.lightBlueGray,
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  textArea: {
    marginBottom: 24,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    backgroundColor: colors.royalBlue,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    borderColor: colors.lightBlueGray,
  },
})
