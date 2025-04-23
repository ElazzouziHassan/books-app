"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from "react-native"
import { Button, Card, Title, Paragraph, Chip, Divider } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"
import type { BorrowRequest } from "../types"

export default function RequestsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("received")
  const [receivedRequests, setReceivedRequests] = useState<BorrowRequest[]>([])
  const [sentRequests, setSentRequests] = useState<BorrowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    loadRequests()
  }, [activeTab])

  const loadRequests = async () => {
    try {
      setLoading(true)
      if (activeTab === "received") {
        await fetchReceivedRequests()
      } else {
        await fetchSentRequests()
      }
    } catch (error) {
      console.error("Error loading requests:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchReceivedRequests = async () => {
    const response = await fetch(`${API_URL}/books/requests/received`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch received requests")
    }

    const data = await response.json()
    setReceivedRequests(data)
  }

  const fetchSentRequests = async () => {
    const response = await fetch(`${API_URL}/books/requests/sent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch sent requests")
    }

    const data = await response.json()
    setSentRequests(data)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadRequests()
  }

  const handleRespondToRequest = async (requestId: number, status: "accepted" | "rejected") => {
    try {
      setProcessingId(requestId)
      const response = await fetch(`${API_URL}/books/requests/${requestId}/respond`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Failed to ${status} request`)
      }

      setReceivedRequests((prev) => prev.filter((request) => request.id !== requestId))
    } catch (error) {
      console.error(`Error ${status} request:`, error)
      alert(error instanceof Error ? error.message : `Failed to ${status} request`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      setProcessingId(requestId)
      const response = await fetch(`${API_URL}/books/requests/${requestId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to cancel request")
      }

      setSentRequests((prev) => prev.filter((request) => request.id !== requestId))
    } catch (error) {
      console.error("Error cancelling request:", error)
      alert(error instanceof Error ? error.message : "Failed to cancel request")
    } finally {
      setProcessingId(null)
    }
  }

  const renderReceivedRequestItem = ({ item }: { item: BorrowRequest }) => {
    const placeholderImage = "https://via.placeholder.com/150x200/9FB3DF/123458?text=No+Cover"
    const requestDate = new Date(item.requestDate).toLocaleDateString()

    return (
      <Card style={styles.requestCard}>
        <Card.Content>
          <View style={styles.requestHeader}>
            <View style={styles.bookInfo}>
              <Title style={styles.bookTitle}>{item.bookTitle}</Title>
              <Paragraph style={styles.bookAuthor}>by {item.bookAuthor}</Paragraph>
            </View>
            <Chip icon="clock" style={styles.dateChip}>
              {requestDate}
            </Chip>
          </View>

          <View style={styles.requesterInfo}>
            <Ionicons name="person" size={20} color={colors.royalBlue} style={styles.requesterIcon} />
            <Text style={styles.requesterName}>
              Request from <Text style={styles.boldText}>{item.requesterName}</Text>
            </Text>
          </View>

          {item.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Message:</Text>
              <Text style={styles.messageText}>"{item.message}"</Text>
            </View>
          )}
        </Card.Content>

        <Divider style={styles.divider} />

        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            style={styles.acceptButton}
            loading={processingId === item.id}
            disabled={processingId === item.id}
            onPress={() => handleRespondToRequest(item.id, "accepted")}
            icon={({ size, color }) => <Ionicons name="checkmark" size={size} color={color} />}
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            style={styles.rejectButton}
            loading={processingId === item.id}
            disabled={processingId === item.id}
            onPress={() => handleRespondToRequest(item.id, "rejected")}
            icon={({ size, color }) => <Ionicons name="close" size={size} color={color} />}
          >
            Reject
          </Button>
        </Card.Actions>
      </Card>
    )
  }

  const renderSentRequestItem = ({ item }: { item: BorrowRequest }) => {
    const placeholderImage = "https://via.placeholder.com/150x200/9FB3DF/123458?text=No+Cover"
    const requestDate = new Date(item.requestDate).toLocaleDateString()
    const isPending = item.status === "pending"

    return (
      <Card style={styles.requestCard}>
        <Card.Content>
          <View style={styles.requestHeader}>
            <View style={styles.bookInfo}>
              <Title style={styles.bookTitle}>{item.bookTitle}</Title>
              <Paragraph style={styles.bookAuthor}>by {item.bookAuthor}</Paragraph>
            </View>
            <Chip
              icon={isPending ? "clock" : item.status === "accepted" ? "check" : "close"}
              style={[
                styles.statusChip,
                isPending ? styles.pendingChip : item.status === "accepted" ? styles.acceptedChip : styles.rejectedChip,
              ]}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Chip>
          </View>

          <View style={styles.requesterInfo}>
            <Ionicons name="person" size={20} color={colors.royalBlue} style={styles.requesterIcon} />
            <Text style={styles.requesterName}>
              Book owned by <Text style={styles.boldText}>{item.ownerName}</Text>
            </Text>
          </View>

          <View style={styles.dateInfo}>
            <Ionicons name="calendar" size={20} color={colors.lightBlueGray} style={styles.dateIcon} />
            <Text style={styles.dateText}>Requested on {requestDate}</Text>
          </View>

          {item.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Your message:</Text>
              <Text style={styles.messageText}>"{item.message}"</Text>
            </View>
          )}
        </Card.Content>

        {isPending && (
          <>
            <Divider style={styles.divider} />
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                style={styles.cancelButton}
                loading={processingId === item.id}
                disabled={processingId === item.id}
                onPress={() => handleCancelRequest(item.id)}
                icon={({ size, color }) => <Ionicons name="trash" size={size} color={color} />}
              >
                Cancel Request
              </Button>
            </Card.Actions>
          </>
        )}
      </Card>
    )
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name={activeTab === "received" ? "mail" : "paper-plane"} size={64} color={colors.lightGray} />
      <Text style={styles.emptyTitle}>No {activeTab === "received" ? "Received" : "Sent"} Requests</Text>
      <Text style={styles.emptyMessage}>
        {activeTab === "received"
          ? "You don't have any pending requests from other users."
          : "You haven't sent any borrow requests yet."}
      </Text>
      {activeTab === "sent" && (
        <Button
          mode="contained"
          style={styles.browseButton}
          onPress={() => navigation.navigate("Home")}
          icon={({ size, color }) => <Ionicons name="search" size={size} color={color} />}
        >
          Browse Books
        </Button>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Ionicons name="mail" size={22} color={colors.white} style={styles.headerIcon} /> Book Requests
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Ionicons
            name="download"
            size={20}
            color={activeTab === "received" ? colors.royalBlue : colors.lightBlueGray}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === "received" && styles.activeTabText]}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "sent" && styles.activeTab]}
          onPress={() => setActiveTab("sent")}
        >
          <Ionicons
            name="send"
            size={20}
            color={activeTab === "sent" ? colors.royalBlue : colors.lightBlueGray}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, activeTab === "sent" && styles.activeTabText]}>Sent</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.royalBlue} />
        </View>
      ) : (
        <FlatList
          data={activeTab === "received" ? receivedRequests : sentRequests}
          renderItem={activeTab === "received" ? renderReceivedRequestItem : renderSentRequestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.royalBlue]} />
          }
          ListEmptyComponent={renderEmptyList}
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.royalBlue,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    color: colors.lightBlueGray,
  },
  activeTabText: {
    color: colors.royalBlue,
    fontWeight: "bold",
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: colors.lightBlueGray,
  },
  dateChip: {
    backgroundColor: colors.lightPeriwinkle,
  },
  statusChip: {
    height: 30,
  },
  pendingChip: {
    backgroundColor: colors.lightPeriwinkle,
  },
  acceptedChip: {
    backgroundColor: colors.success,
  },
  rejectedChip: {
    backgroundColor: colors.error,
  },
  requesterInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requesterIcon: {
    marginRight: 8,
  },
  requesterName: {
    fontSize: 14,
    color: colors.darkNavy,
  },
  boldText: {
    fontWeight: "bold",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: colors.lightBlueGray,
  },
  messageContainer: {
    backgroundColor: colors.lightPeriwinkle + "20",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.darkNavy,
    fontStyle: "italic",
  },
  divider: {
    marginVertical: 8,
  },
  cardActions: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  acceptButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.success,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: colors.error,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.error,
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
    marginTop: 40,
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
