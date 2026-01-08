import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenGradient from "../components/ScreenGradient";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerWrapper}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={styles.backButton}>
                <Ionicons name="chevron-back" size={22} color={PRIMARY} />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <Text style={styles.headerSubtitle}>Last updated: {new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardText}>Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our app.</Text>
          </View>

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
    padding: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },

  headerWrapper: {
    marginBottom: 16,
  },

  headerRow: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },

  backButton: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    alignItems: "center",
    paddingHorizontal: 48,
  },

  headerTitle: {
    fontSize: 22,
    color: "#0F172A",
    fontFamily: "interSemiBold",
    letterSpacing: -0.2,
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    fontFamily: "interRegular",
  },

  /* Card */
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  cardText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    fontFamily: "interRegular",
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
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  sectionNumberText: {
    fontSize: 12,
    color: PRIMARY,
    fontFamily: "interSemiBold",
  },

  sectionTitle: {
    fontSize: 16,
    color: "#0F172A",
    fontFamily: "interMedium",
  },

  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
    fontFamily: "interRegular",
  },
});
