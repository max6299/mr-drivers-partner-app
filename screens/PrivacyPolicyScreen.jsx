import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenGradient from "../components/ScreenGradient";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerSide}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
                <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Privacy Policy</Text>
              <Text style={styles.headerSubtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
            </View>

            <View style={styles.headerSide} />
          </View>

          {/* Intro */}
          <View style={styles.card}>
            <Text style={styles.cardText}>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.</Text>
          </View>

          {/* Sections */}
          <PolicySection number="1" title="Information We Collect" text="We may collect personal information such as your name, email address, phone number, and payment details when you register or use our services." />

          <PolicySection number="2" title="How We Use Information" text="The information collected is used to provide, maintain, and improve our services, communicate with you, and ensure account security." />

          <PolicySection number="3" title="Data Sharing" text="We do not sell your personal information. We may share data with trusted third-party service providers for operational purposes." />

          <PolicySection number="4" title="Security" text="We implement reasonable security measures to protect your information. However, no method of transmission over the internet is completely secure." />

          <PolicySection number="5" title="Changes to This Policy" text="We may update this Privacy Policy from time to time. Changes will be posted in the app, and your continued use constitutes acceptance." />
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

function PolicySection({ title, number, text }) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionNumber}>
          <Text style={styles.sectionNumberText}>{number}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Card */
  card: {
    backgroundColor: Colors.whiteColor,
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  cardText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.midnight_blue_800,
  },

  /* Section */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  sectionNumberText: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.peter_river_600,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },

  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.midnight_blue_800,
  },
});
