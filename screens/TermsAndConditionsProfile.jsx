import React from "react";
import { ScrollView, StatusBar, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import appStyle from "../lib/style";
import ScreenGradient from "../components/ScreenGradient";

const { Fonts, Colors } = appStyle;
const PRIMARY = "#0193e0";

const TermsAndConditionsScreenProfile = () => {
  const navigation = useNavigation();

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color={PRIMARY} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.title}>Terms & Conditions</Text>
              <Text style={styles.subtitle}>Last updated: 08 January 2026</Text>
            </View>
          </View>

          <Text style={styles.paragraph}>
            This Privacy Policy explains how <Text style={styles.bold}>Mr Driver Partner</Text> (“we”, “our”, “us”) collects, uses, protects and shares information when Driver Partners use the Mr Driver Partner mobile application (“Partner App”, “Service”).
          </Text>

          <Text style={styles.paragraph}>By using the Partner App, you agree to this Privacy Policy.</Text>

          <Section title="1. Information We Collect" content={["Personal information such as name, mobile number and optional email address", "Live GPS location while online and during active trips", "Trip and usage details including time, distance and booking history", "Device and technical details such as model, OS version and IP address"]} />

          <Section title="2. How We Use Your Information" content={["Create and manage driver partner accounts", "Display availability and assign bookings", "Provide navigation, trip tracking and safety monitoring", "Offer customer and driver support", "Prevent fraud and improve system performance"]} />

          <Section title="3. Sharing of Information" content={["With users during assigned bookings (name and live location)", "With third-party service providers (SMS, OTP, cloud services)", "With authorities when legally required", "To protect platform integrity, users and drivers"]} />

          <Text style={styles.paragraph}>
            We <Text style={styles.bold}>do not sell or rent</Text> your personal information.
          </Text>

          <Section title="4. Location Usage" content={["Live location is used while online to match nearby bookings", "Trip movement is tracked for navigation and safety", "Location tracking stops when you go offline or log out"]} />

          <Text style={styles.paragraph}>Disabling location access means you will not be able to accept bookings.</Text>

          <Section title="5. Data Security" content={["Encryption and security controls where appropriate", "Restricted and monitored system access", "No transmission or storage system is completely secure"]} />

          <Section title="6. Data Retention" content={["Data retained while your account remains active", "Stored as required for legal, operational or security purposes", "You may request account deletion at any time"]} />

          <Section title="7. Your Rights" content={["Update your profile information", "Manage app permissions", "Request account closure and data deletion"]} />

          <Section title="8. Eligibility / Age Limit" content={["Service is intended only for adults aged 18 or above", "We do not knowingly collect data from minors"]} />

          <Section title="9. Changes to This Policy" content={["This policy may be updated periodically", "The revised date will be displayed in the app"]} />

          <Section title="10. Contact Us" content={["Email: mrdriversin@gmail.com"]} />
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
};

export default TermsAndConditionsScreenProfile;

function Section({ title, content }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionDot} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {content.map((item, index) => (
        <Text key={index} style={styles.listItem}>
          {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  headerRow: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    paddingTop: 10,
  },

  backButton: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.clouds_200,
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    alignItems: "center",
    paddingHorizontal: 48,
  },

  title: {
    fontSize: 26,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
    backgroundColor: Colors.clouds_200,
    padding: 20,
    borderRadius: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  bold: {
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  sectionCard: {
    backgroundColor: Colors.clouds_200,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginRight: 8,
  },

  sectionTitle: {
    fontSize: 16,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  listItem: {
    fontSize: 14.5,
    lineHeight: 22,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
    marginBottom: 6,
  },
});
