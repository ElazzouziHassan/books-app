"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Image, RefreshControl, Alert } from "react-native"
import { Text, Button, ActivityIndicator, Card } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { API_URL } from "../config"
import { colors } from "../theme/colors"
import { Ionicons } from "@expo/vector-icons"

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ ownedBooks: 0, borrowedBooks: 0 })
  const { token } = useAuth()

  useEffect(() => {
    loadUserStats()
  }, [])

  const loadUserStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/books/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user stats")
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error loading user stats:", error)
      Alert.alert("Error", "Failed to load user statistics")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadUserStats()
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.royalBlue} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.royalBlue]} />}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=8E7DBE&color=fff&size=256` }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.borrowedBooks}</Text>
            <Text style={styles.statLabel}>Borrowed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.ownedBooks}</Text>
            <Text style={styles.statLabel}>Added</Text>
          </View>
        </View>

        <Card style={styles.actionsCard}>
          <Card.Content>
            <Button
              mode="contained"
              style={styles.actionButton}
              onPress={() => navigation.navigate("Home")}
            >
              Browse Available Books
            </Button>

            <Button
              mode="contained"
              style={[styles.actionButton, { backgroundColor: colors.lavender }]}
              onPress={() => navigation.navigate("Borrowed")}
            >
              Borrowed Books
            </Button>

            <Button
              mode="contained"
              style={[styles.actionButton, { backgroundColor: colors.lightBlueGray }]}
              onPress={() => navigation.navigate("Manage", { screen: "AddEditBook" })}
            >
              Add New Book
            </Button>

            <Button mode="outlined" style={styles.logoutButtonFull} icon="logout" onPress={handleLogout}>
              Logout
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.lightPeriwinkle,
    borderBottomLeftRadius: 27,
    borderBottomRightRadius: 27,
  },
  avatarContainer: {
    marginRight: 20,
    marginBottom:5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.darkNavy,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 15,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.royalBlue,
  },
  statLabel: {
    fontSize: 14,
    color: colors.lightBlueGray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: 15,
  },
  actionsCard: {
    margin: 20,
    marginTop: 30,
    borderRadius: 12,
    elevation: 4,
  },
  actionButton: {
    marginVertical: 8,
    backgroundColor: colors.royalBlue,
    paddingVertical: 8,
  },
  logoutButtonFull: {
    marginVertical: 8,
    borderColor: colors.error,
    borderWidth: 1,
  },
})
