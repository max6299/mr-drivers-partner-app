import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import appStyle from "../lib/style";
import Toast from "react-native-toast-message";

const { Colors, Fonts } = appStyle;

export default function DeactivateAccountScreen({ navigation }) {
  const { authPostFetch, mrDriverPartnerLogout } = useAuth();
  const [password, setPassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDeactivate = async () => {
    if (!password.trim()) {
      Toast.show({
        type: "error",
        text1: "Password Required",
        text2: "Please enter your password to deactivate your account.",
      });
      return;
    }

    try {
      setDeactivating(true);
      const bodyTxt = { password };
      const res = await authPostFetch("driver/deleteAccount", bodyTxt, true);
      if (res?.success) {
        mrDriverPartnerLogout();
      } else {
        Toast.show({
          type: "error",
          text1: "Deactivation Failed",
          text2: res?.message || "Something went wrong",
        });
        setDeactivating(false);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Something Went Wrong",
        text2: err?.message || "Deactivation failed",
      });
      setDeactivating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Deactivate Account</Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        <View style={styles.warningCard}>
          <View style={styles.warningIconRow}>
            <Ionicons name="warning-outline" size={24} color={Colors.alizarin_600} />
          </View>
          <Text style={styles.warningTitle}>Deactivate Account</Text>
          <Text style={styles.warningText}>
            Your account will be deactivated and you won't be able to sign in. Contact support if you need to restore it.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.peter_river_600} />
              <Text style={styles.labelText}>Confirm Password</Text>
            </View>

            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors.concrete}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} activeOpacity={0.7}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={Colors.asbestos} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleDeactivate} disabled={deactivating} style={[styles.deactivateButton, deactivating && styles.deactivateButtonDisabled]}>
            {deactivating ? (
              <ActivityIndicator color={Colors.whiteColor} size="small" />
            ) : (
              <Text style={styles.deactivateButtonText}>Deactivate My Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  headerSide: {
    width: 48,
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  warningCard: {
    backgroundColor: Colors.alizarin_50,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.alizarin_200,
  },

  warningIconRow: {
    marginBottom: 12,
  },

  warningTitle: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.alizarin_700,
    marginBottom: 8,
  },

  warningText: {
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.alizarin_600,
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    backgroundColor: Colors.whiteColor,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  inputGroup: {
    marginBottom: 24,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  labelText: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.asbestos,
  },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: Colors.clouds_400,
    borderRadius: 14,
    backgroundColor: Colors.whiteColor,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.midnight_blue_900,
  },

  eyeButton: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  deactivateButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.alizarin_600,
    justifyContent: "center",
    alignItems: "center",
  },

  deactivateButtonDisabled: {
    opacity: 0.7,
  },

  deactivateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },
});