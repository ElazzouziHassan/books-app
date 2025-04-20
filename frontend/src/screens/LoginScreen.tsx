"use client"

import { useState } from "react"
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { TextInput, Button } from "react-native-paper"
import { useAuth } from "../context/AuthContext"
import { colors } from "../theme/colors"
import { API_URL } from "../config"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      await login(email, password)
    } catch (error) {
      // Error is handled in the context
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }

      Alert.alert("Success", "Password reset email sent. Please check your inbox.")
      setShowForgotPassword(false)
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to send reset email")
    }
  }

  if (showForgotPassword) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a password reset link</Text>

          <TextInput
            label="Email"
            value={forgotPasswordEmail}
            onChangeText={setForgotPasswordEmail}
            style={styles.input}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            outlineColor={colors.lightBlueGray}
            activeOutlineColor={colors.royalBlue}
          />

          <Button mode="contained" onPress={handleForgotPassword} style={styles.button} labelStyle={styles.buttonLabel}>
            Send Reset Link
          </Button>

          <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Book Borrowing App</Text>
        <Text style={styles.subtitle}>Login to your account</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
          outlineColor={colors.lightBlueGray}
          activeOutlineColor={colors.royalBlue}
        />

        <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          disabled={isLoading}
          loading={isLoading}
        >
          Login
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
  },
  formContainer: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.darkNavy,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.lightBlueGray,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  forgotPassword: {
    color: colors.royalBlue,
    textAlign: "right",
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: colors.royalBlue,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: colors.black,
  },
  link: {
    color: colors.royalBlue,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
})
