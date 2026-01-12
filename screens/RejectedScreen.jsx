import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../lib/style";
import { useAuth } from "../context/useAuth";
import Toast from "react-native-toast-message";

const PRIMARY = "#DC2626";

const RejectedScreen = ({ navigation }) => {
  const { authPostFetch, ownUser, mrDriverPartnerLogout } = useAuth();

  const handleResetInfo = async () => {
    const res = await authPostFetch("driver/resetInfo", true);
    if (!res.success) {
      return Toast.show({
        type: "error",
        text1: "Unable to reset",
        text2: "Please try again later",
      });
    }

    Toast.show({
      type: "success",
      text1: "Please sign in again",
      text2: "Sign in again to update details",
    });
    mrDriverPartnerLogout();
    navigation.navigate("sign-in");
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="close-circle-outline" size={80} color={PRIMARY} />
      </View>

      <Text style={styles.title}>Application Rejected</Text>

      <Text style={styles.subtitle}>
        Your application was rejected due to <Text style={styles.reasonText}>{ownUser?.reasonForRejection}</Text>. Please review and submit the details again, or <Text style={styles.supportText}>contact support</Text> if you need help.
      </Text>

      <TouchableOpacity activeOpacity={0.85} style={styles.signInButton} onPress={() => handleResetInfo()}>
        <Text style={styles.signInButtonText}>Click here to reset and upload again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RejectedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapper: {
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    color: "#111827",
    fontFamily: Fonts.GoogleSansFlex,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: Fonts.GoogleSansFlex,
    textAlign: "center",
    lineHeight: 22,
  },

  reasonText: {
    fontFamily: Fonts.GoogleSansFlex,
    color: "#111827",
  },

  supportText: {
    fontFamily: Fonts.GoogleSansFlex,
    color: PRIMARY,
  },

  signInButton: {
    marginTop: 32,
    width: "100%",
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0193e0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  signInButtonText: {
    fontSize: 15,
    color: "#0193e0",
    fontFamily: Fonts.GoogleSansFlex,
  },
});
