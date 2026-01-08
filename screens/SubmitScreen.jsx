import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../lib/style";

const PRIMARY = "#0193E0";

export default function SubmitScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="checkmark" size={40} color={"#fff"} />
        </View>

        <Text style={styles.title}>Application submitted</Text>

        <Text style={styles.description}>Your application has been successfully submitted and is now under verification.</Text>

        <Text style={styles.descriptionSecondary}>
          We’ll get back to you within <Text style={styles.highlight}>48 working hours</Text>.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate("home")} style={styles.button}>
          <Text style={styles.buttonText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
    marginBottom: 6,
  },

  descriptionSecondary: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: Colors.silver_600,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  highlight: {
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    color: Colors.whiteColor,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
