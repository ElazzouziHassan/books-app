"use client"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useAuth } from "../context/AuthContext"
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import HomeScreen from "../screens/HomeScreen"
import BookDetailsScreen from "../screens/BookDetailsScreen"
import BorrowedBooksScreen from "../screens/BorrowedBooksScreen"
import ManageBooksScreen from "../screens/ManageBooksScreen"
import AddEditBookScreen from "../screens/AddEditBookScreen"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"
import ProfileScreen from "../screens/ProfileSreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="BooksList" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookDetails" component={BookDetailsScreen} options={{ title: "Book Details" }} />
    </Stack.Navigator>
  )
}

function BorrowedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="BorrowedBooks" component={BorrowedBooksScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function ManageStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="ManageBooks" component={ManageBooksScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddEditBook" component={AddEditBookScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function ProfileStack() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerStyle: { backgroundColor: colors.darkNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "bold" },
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="UserProfile" component={ProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "book" : "book-outline"
          } else if (route.name === "Borrowed") {
            iconName = focused ? "bookmark" : "bookmark-outline"
          } else if (route.name === "Manage") {
            iconName = focused ? "library" : "library-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: colors.royalBlue,
        tabBarInactiveTintColor: colors.lightBlueGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.lightGray,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Borrowed" component={BorrowedStack} />
      <Tab.Screen name="Manage" component={ManageStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return null 
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? <Stack.Screen name="Main" component={MainTabs} /> : <Stack.Screen name="Auth" component={AuthStack} />}
    </Stack.Navigator>
  )
}
