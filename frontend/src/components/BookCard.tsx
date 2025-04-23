import type React from "react"
import { View, StyleSheet, Image, Dimensions } from "react-native"
import { Card, Title, Paragraph, Button, Badge, Text } from "react-native-paper"
import type { Book } from "../types"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

interface BookCardProps {
  book: Book
  onPress: () => void
  onRequest?: () => void
  onReturn?: () => void
  showRequestButton?: boolean
  showReturnButton?: boolean
  borrowedDate?: string
  dueDate?: string
  isLoading?: boolean
  isOwnedByUser?: boolean
  ownerName?: string
  compact?: boolean
}

const { width } = Dimensions.get("window")

const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onRequest,
  onReturn,
  showRequestButton = false,
  showReturnButton = false,
  borrowedDate,
  dueDate,
  isLoading = false,
  isOwnedByUser = false,
  ownerName,
  compact = false,
}) => {
  const placeholderImage = "https://via.placeholder.com/150x200/9FB3DF/123458?text=No+Cover"
  const hasPendingRequest = book.requestStatus && book.requestStatus.status === "pending"

  if (compact) {
    return (
      <Card style={[styles.compactCard, !book.available && styles.unavailableCard]} onPress={onPress}>
        <View style={styles.compactImageContainer}>
          <Image
            source={{ uri: book.coverImage || placeholderImage }}
            style={styles.compactCoverImage}
            resizeMode="cover"
          />
          {!book.available && <Badge style={styles.compactUnavailableBadge}>Unavailable</Badge>}
          {isOwnedByUser && <Badge style={styles.compactOwnedBadge}>Your Book</Badge>}
          {hasPendingRequest && <Badge style={styles.compactPendingBadge}>Pending</Badge>}
        </View>
        <Card.Content style={styles.compactContent}>
          <Title style={styles.compactTitle} numberOfLines={2}>
            {book.title}
          </Title>
          <Paragraph style={styles.compactAuthor} numberOfLines={1}>
            by {book.author}
          </Paragraph>
          <View style={styles.compactInfoRow}>
            <Text style={styles.compactInfoLabel}>Year:</Text>
            <Text style={styles.compactInfoValue}>{book.publishedYear}</Text>
          </View>
        </Card.Content>
      </Card>
    )
  }

  return (
    <Card style={[styles.card, !book.available && !showReturnButton && styles.unavailableCard]} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: book.coverImage || placeholderImage }} style={styles.coverImage} resizeMode="cover" />
          {!book.available && !showReturnButton && <Badge style={styles.unavailableBadge}>Not Available</Badge>}
          {isOwnedByUser && <Badge style={styles.ownedBadge}>Your Book</Badge>}
          {hasPendingRequest && <Badge style={styles.pendingBadge}>Request Sent</Badge>}
        </View>

        <View style={styles.detailsContainer}>
          <Title style={styles.title} numberOfLines={2}>
            {book.title}
          </Title>
          <Paragraph style={styles.author} numberOfLines={1}>
            by {book.author}
          </Paragraph>

          {ownerName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Owner:</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {ownerName}
              </Text>
            </View>
          )}

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

          {showRequestButton && book.available && !isOwnedByUser && !hasPendingRequest && (
            <Button
              mode="contained"
              style={styles.actionButton}
              loading={isLoading}
              disabled={isLoading}
              onPress={(e) => {
                e.stopPropagation()
                if (onRequest) onRequest()
              }}
              icon={({ size, color }) => <Ionicons name="send" size={size} color={color} />}
            >
              Request Book
            </Button>
          )}

          {showRequestButton && book.available && !isOwnedByUser && hasPendingRequest && (
            <Button
              mode="outlined"
              style={styles.pendingButton}
              disabled
              icon={({ size, color }) => <Ionicons name="time" size={size} color={color} />}
            >
              Request Pending
            </Button>
          )}

          {showRequestButton && book.available && isOwnedByUser && (
            <Button
              mode="outlined"
              style={styles.ownedButton}
              disabled
              icon={({ size, color }) => <Ionicons name="book-outline" size={size} color={color} />}
            >
              Your Book
            </Button>
          )}

          {showRequestButton && !book.available && (
            <Button
              mode="outlined"
              style={styles.actionButton}
              disabled
              icon={({ size, color }) => <Ionicons name="close-circle" size={size} color={color} />}
            >
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
              icon={({ size, color }) => <Ionicons name="return-down-back" size={size} color={color} />}
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
  ownedBadge: {
    position: "absolute",
    top: 8,
    right: -10,
    backgroundColor: colors.success,
    color: colors.white,
  },
  pendingBadge: {
    position: "absolute",
    top: 8,
    right: -10,
    backgroundColor: colors.lavender,
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
  ownedButton: {
    marginTop: 12,
    borderColor: colors.success,
  },
  pendingButton: {
    marginTop: 12,
    borderColor: colors.lavender,
  },
  returnButton: {
    marginTop: 12,
    backgroundColor: colors.lavender,
  },

  compactCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: colors.white,
    flex: 1,
    margin: 6,
  },
  compactImageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
  },
  compactCoverImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: colors.lightPeriwinkle,
  },
  compactContent: {
    padding: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 2,
    lineHeight: 18,
  },
  compactAuthor: {
    fontSize: 12,
    color: colors.lightBlueGray,
    marginBottom: 4,
  },
  compactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  compactInfoLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginRight: 4,
  },
  compactInfoValue: {
    fontSize: 12,
    color: colors.black,
  },
  compactUnavailableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    color: colors.white,
    fontSize: 10,
  },
  compactOwnedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.success,
    color: colors.white,
    fontSize: 10,
  },
  compactPendingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.lavender,
    color: colors.white,
    fontSize: 10,
  },
})

export default BookCard
