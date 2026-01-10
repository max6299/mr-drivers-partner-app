import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../lib/style";

function InputField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, maxLength, rightIcon, onRightIconPress }) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color="#6B7280" />
      <TextInput placeholder={placeholder} value={value} onChangeText={onChangeText} secureTextEntry={secureTextEntry} keyboardType={keyboardType} maxLength={maxLength} placeholderTextColor="#9CA3AF" style={styles.input} />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress}>
          <Ionicons name={rightIcon} size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SignUpScreen() {
  const { mrDriverPartnerSignup } = useAuth();

  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showError = (title, message) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      text1Style: { fontSize: 13 },
      text2Style: { fontSize: 12 },
    });
  };

  const handleSignUp = async () => {
    if (isLoading) return;

    if (!fullName.trim()) {
      return showError("Full name required", "Please enter your full name.");
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      return showError("Invalid mobile number", "Please enter a valid 10-digit mobile number.");
    }

    if (password.length < 6) {
      return showError("Weak password", "Password must be at least 6 characters long.");
    }

    if (password !== confirmPassword) {
      return showError("Password mismatch", "Both passwords must be the same.");
    }

    setIsLoading(true);

    try {
      const bodyTxt = {
        fullName,
        mobileNumber,
        password,
        regiStatus: "verif",
      };

      const res = await mrDriverPartnerSignup(bodyTxt);
      if (!res?.success) {
        return;
      }

      navigation.navigate("verify-otp");
    } catch (err) {
      showError("Something went wrong", "Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start earning today</Text>
        </View>

        <View style={styles.inputGroup}>
          <InputField icon="person-outline" placeholder="Full Name" value={fullName} onChangeText={setFullName} />

          <InputField icon="call-outline" placeholder="Mobile Number" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="number-pad" maxLength={10} />

          <InputField icon="lock-closed-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} rightIcon={showPassword ? "eye-off-outline" : "eye-outline"} onRightIconPress={() => setShowPassword(!showPassword)} />

          <InputField icon="shield-checkmark-outline" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"} onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)} />
        </View>

        <TouchableOpacity onPress={handleSignUp} disabled={isLoading} activeOpacity={0.85} style={styles.buttonWrapper}>
          <LinearGradient colors={["#0193e0", "#00b4ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>{isLoading ? "Creating account..." : "Create Account"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.signInText} onPress={() => navigation.navigate("sign-in")}>
            Sign In
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  /* Main */
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    color: "#111827",
    fontFamily: Fonts.GoogleSansFlex,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: Fonts.GoogleSansFlex,
    textAlign: "center",
  },

  /* Inputs */
  inputGroup: {
    gap: 16,
  },

  /* Footer */
  footerText: {
    marginTop: 24,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: Fonts.GoogleSansFlex,
  },
  signInText: {
    color: PRIMARY,
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
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontFamily: Fonts.GoogleSansFlex,
  },

  buttonWrapper: {
    marginTop: 32,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0193e0",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },

  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },

  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: Fonts.GoogleSansFlex,
  },
});
