import type React from "react"
import { View, StyleSheet, Image } from "react-native"
import { Card, Title, Paragraph, Button, Badge, Text } from "react-native-paper"
import type { Book } from "../types"
import { colors } from "../theme/colors"

interface BookCardProps {
  book: Book
  onPress: () => void
  onBorrow?: () => void
  onReturn?: () => void
  showBorrowButton?: boolean
  showReturnButton?: boolean
  borrowedDate?: string
  dueDate?: string
  isLoading?: boolean
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onBorrow,
  onReturn,
  showBorrowButton = false,
  showReturnButton = false,
  borrowedDate,
  dueDate,
  isLoading = false,
}) => {
  const placeholderImage = "https://via.placeholder.com/150x200/9FB3DF/123458?text=No+Cover"

  return (
    <Card style={[styles.card, !book.available && !showReturnButton && styles.unavailableCard]} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: book.coverImage || placeholderImage }} style={styles.coverImage} resizeMode="cover" />
          {!book.available && !showReturnButton && <Badge style={styles.unavailableBadge}>Not Available</Badge>}
        </View>

        <View style={styles.detailsContainer}>
          <Title style={styles.title} numberOfLines={2}>
            {book.title}
          </Title>
          <Paragraph style={styles.author} numberOfLines={1}>
            by {book.author}
          </Paragraph>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {book.isbn}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year:</Text>
            <Text style={styles.infoValue}>{book.publishedYear}</Text>
          </View>

          {borrowedDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Borrowed:</Text>
              <Text style={styles.infoValue}>{new Date(borrowedDate).toLocaleDateString()}</Text>
            </View>
          )}

          {dueDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Due:</Text>
              <Text style={[styles.infoValue, new Date(dueDate) < new Date() ? styles.overdue : null]}>
                {new Date(dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}

          {showBorrowButton && book.available && (
            <Button
              mode="contained"
              style={styles.actionButton}
              loading={isLoading}
              disabled={isLoading}
              onPress={(e) => {
                e.stopPropagation()
                if (onBorrow) onBorrow()
              }}
            >
              Borrow
            </Button>
          )}

          {showBorrowButton && !book.available && (
            <Button mode="outlined" style={styles.actionButton} disabled>
              Not Available
            </Button>
          )}

          {showReturnButton && (
            <Button
              mode="contained"
              style={styles.returnButton}
              loading={isLoading}
              disabled={isLoading}
              onPress={(e) => {
                e.stopPropagation()
                if (onReturn) onReturn()
              }}
            >
              Return Book
            </Button>
          )}
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: colors.white,
  },
  unavailableCard: {
    borderLeftWidth: 5,
    borderLeftColor: colors.error,
    opacity: 0.8,
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    position: "relative",
    marginRight: 16,
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: colors.lightPeriwinkle,
  },
  unavailableBadge: {
    position: "absolute",
    top: 8,
    right: -10,
    backgroundColor: colors.error,
    color: colors.white,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: colors.lightBlueGray,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.darkNavy,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  overdue: {
    color: colors.error,
    fontWeight: "bold",
  },
  actionButton: {
    marginTop: 12,
    backgroundColor: colors.royalBlue,
  },
  returnButton: {
    marginTop: 12,
    backgroundColor: colors.lavender,
  },
})

export default BookCard
