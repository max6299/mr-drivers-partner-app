import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "../lib/style";
import { useAuth } from "../context/useAuth";
import Toast from "react-native-toast-message";

const PRIMARY = "#0193e0";

const ForgotPasswordScreen = ({ navigation }) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const { authPostFetch } = useAuth();

  const handleForgotPassword = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      return Toast.show({
        type: "error",
        text1: "Invalid mobile number",
        text2: "Enter a valid 10-digit mobile number.",
      });
    }

    try {
      const res = await authPostFetch("driver/sendResetPasswordOTP", { mobileNumber: mobileNumber });
      if (!res.success) {
        Toast.show({
          type: "info",
          text1: "Unable to send OTP",
          text2: "Plese try again later",
          text2Style: { fontSize: 12 },
        });
      }
      navigation.navigate("verify-forgotpassword-otp", { mobileNumber: mobileNumber });
    } catch (error) {
      console.error("LOGIN ERROR:", err?.response?.data || err.message);
      Toast.show({ type: "error", text2: "Something went wrong" });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your registered mobile number to receive an OTP</Text>
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="call-outline" size={20} color="#6B7280" />
        <TextInput placeholder="Mobile Number" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} style={styles.input} />
      </View>

      <TouchableOpacity activeOpacity={0.85} style={styles.buttonWrapper} onPress={() => handleForgotPassword()}>
        <LinearGradient colors={["#0193e0", "#00b4ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("sign-in")}>
        <Text style={styles.footerText}>
          Remembered your password? <Text style={styles.signInText}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: "#111827",
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
    fontFamily: Fonts.GoogleSansFlex,
  },

  buttonWrapper: {
    marginTop: 32,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: PRIMARY,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: Fonts.GoogleSansFlex,
  },

  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: Fonts.GoogleSansFlex,
  },
  signInText: {
    color: PRIMARY,
    fontFamily: Fonts.GoogleSansFlex,
  },
});
