import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";
import { Fonts } from "../lib/style";
import { useAuth } from "../context/useAuth";

const PRIMARY = "#0193e0";

const SetNewPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { authPostFetch } = useAuth();

  const route = useRoute();

  const { mobileNumber } = route.params || {};

  const savePassword = async () => {
    if (isSaving) return;

    if (!password || password.length < 6) {
      return Toast.show({
        type: "error",
        text1: "Weak password",
        text2: "Password must be at least 6 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return Toast.show({
        type: "error",
        text1: "Password mismatch",
        text2: "Both passwords must be the same.",
      });
    }

    setIsSaving(true);

    try {
      const bodyTxt = {
        mobileNumber: mobileNumber,
        newPassword: password,
      };
      const res = await authPostFetch("driver/setNewPassword", bodyTxt);
      if (!res?.success) {
        return Toast.show({
          type: "error",
          text1: "Password update failed",
          text2: res?.message || "Unable to update password. Please try again.",
          text2NumberOfLines: 3,
        });
      }

      Toast.show({
        type: "success",
        text1: "Password updated",
        text2: "You can now sign in with your new password.",
      });
      navigation.navigate("sign-in");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: "Please check your internet connection and try again.",
        text2NumberOfLines: 3,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Create a new password for your account.</Text>
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
        <TextInput placeholder="New Password" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={styles.input} />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
        <TextInput placeholder="Confirm Password" placeholderTextColor="#9CA3AF" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.85} style={[styles.buttonWrapper, isSaving && { opacity: 0.6 }]} disabled={isSaving} onPress={() => savePassword()}>
        <LinearGradient colors={["#0193e0", "#00b4ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>{isSaving ? "Updating..." : "Update Password"}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default SetNewPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  /* Header */
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

  /* Input */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
    fontFamily: Fonts.GoogleSansFlex,
  },

  /* Button */
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
    fontFamily: "interBold",
  },
});
