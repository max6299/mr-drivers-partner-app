import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Linking, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenGradient from "../components/ScreenGradient";
import { faqs } from "../constants/data";
import { ScrollView } from "react-native-gesture-handler";

export default function HelpCenterScreen() {
  const navigation = useNavigation();

  const callSupport = () => {
    Linking.openURL("tel:+919715835816");
  };

  return (
    <ScreenGradient>
      <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.wrapper}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color={PRIMARY} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Help Center</Text>
              <Text style={styles.headerSubtitle}>Find answers to common questions.</Text>
            </View>
          </View>

          <View style={styles.spacer} />

          <View style={styles.faqSection}>
            {faqs?.map((item, index) => (
              <View key={index} style={styles.faqCard}>
                <View style={styles.faqRow}>
                  <View style={styles.faqIconWrapper}>
                    <Ionicons name="help-circle-outline" size={18} color="#0193e0" />
                  </View>

                  <View style={styles.faqContent}>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Ionicons name="chatbubbles-outline" size={28} color="#0193e0" />
            </View>

            <Text style={styles.supportTitle}>Still need help?</Text>

            <Text style={styles.supportSubtitle}>Our support team is available 24/7 to assist you.</Text>

            <TouchableOpacity onPress={callSupport} activeOpacity={0.85} style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenGradient>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    paddingHorizontal: 8,
    paddingTop: 24,
    marginTop: 10,
    paddingBottom: 20,
  },

  headerRow: {
    position: "relative",
    alignItems: "center",
    marginBottom: 24,
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
    textAlign: "center",
  },

  spacer: {
    marginBottom: 24,
  },

  faqSection: {
    marginBottom: 32,
  },

  faqCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  faqRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  faqIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  faqContent: {
    flex: 1,
  },

  faqQuestion: {
    fontSize: 15,
    color: "#0F172A",
    fontFamily: "interMedium",
    lineHeight: 22,
  },

  faqAnswer: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    fontFamily: "interRegular",
  },

  /* Support Card */
  supportCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  supportTitle: {
    marginTop: 14,
    fontSize: 17,
    color: "#0F172A",
    fontFamily: "interSemiBold",
  },

  supportSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#64748B",
    fontFamily: "interRegular",
  },

  contactButton: {
    width: "100%",
    height: 52,
    marginTop: 18,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    justifyContent: "center",
  },

  contactButtonText: {
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "interSemiBold",
  },
});
