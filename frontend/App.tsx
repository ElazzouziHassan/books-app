import { NavigationContainer } from "@react-navigation/native"
import { Provider as PaperProvider } from "react-native-paper"
import { AuthProvider } from "./src/context/AuthContext"
import AppNavigator from "./src/navigation/AppNavigator"
import { theme } from "./src/theme/theme"
import { StatusBar } from "expo-status-bar"

export default function App() {
  return (
    <PaperProvider theme={theme}>
      {/* <StatusBar style="dark" /> */}
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  )
}
