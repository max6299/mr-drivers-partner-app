import React, { useState } from "react";
import { StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../lib/style";

export default function SignInScreen() {
  const { mrDriverPartnerSignin, eventLoading } = useAuth();

  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleSignIn = async () => {
    if (!/^\d{10}$/.test(mobileNumber)) {
      return Toast.show({
        type: "error",
        text2: "Enter a valid 10-digit mobile number.",
      });
    }

    if (!password || !mobileNumber || password.length < 6) {
      return Toast.show({
        type: "error",
        text2: "Please enter both Mobile Number and Password",
      });
    }

    try {
      await mrDriverPartnerSignin({
        mobileNumber: mobileNumber,
        pass: password,
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err?.response?.data || err.message);
      Toast.show({ type: "error", text2: "Something went wrong" });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Welcome back. Let’s get you on the road.</Text>
        </View>

        <View style={styles.inputGroup}>
          <TextInput placeholder="Mobile number" placeholderTextColor={Colors.asbestos} keyboardType="number-pad" maxLength={10} value={mobileNumber} onChangeText={setMobileNumber} style={styles.input} />

          <TextInput placeholder="Password" placeholderTextColor={Colors.asbestos} secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignIn} activeOpacity={0.9} disabled={eventLoading} style={[styles.signInButton, eventLoading && styles.signInButtonDisabled]}>
          <Text style={styles.signInButtonText}>{eventLoading ? "Signing in…" : "Sign In"}</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don’t have an account?{" "}
          <Text style={styles.signUpText} onPress={() => navigation.navigate("sign-up")}>
            Sign up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 36,
  },

  title: {
    fontSize: 32,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },

  inputGroup: {
    gap: 14,
  },

  input: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
    backgroundColor: Colors.clouds_100,
    fontSize: 16,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
  },

  forgotPassword: {
    marginTop: 12,
    textAlign: "right",
    fontSize: 14,
    color: PRIMARY,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  signInButton: {
    marginTop: 28,
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  signInButtonDisabled: {
    opacity: 0.7,
  },

  signInButtonText: {
    fontSize: 16,
    color: Colors.whiteColor,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  footerText: {
    marginTop: 26,
    textAlign: "center",
    color: Colors.asbestos,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  signUpText: {
    color: PRIMARY,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },
});
