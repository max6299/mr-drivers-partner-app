import React from "react";
import { Linking, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import ScreenGradient from "../components/ScreenGradient";
import { faqs } from "../constants/data";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function HelpCenterScreen() {
  const navigation = useNavigation();

  const callSupport = () => {
    Linking.openURL("tel:+123456789");
  };

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView contentContainerStyle={styles.wrapper} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerSide}>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
                <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Help Center</Text>
              <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
            </View>

            <View style={styles.headerSide} />
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            {faqs?.map((item, index) => (
              <View key={index} style={styles.faqCard}>
                <View style={styles.faqRow}>
                  <View style={styles.faqIconWrapper}>
                    <Ionicons name="help-circle-outline" size={18} color={Colors.peter_river_600} />
                  </View>

                  <View style={styles.faqContent}>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Support Card */}
          <View style={styles.supportCard}>
            <View style={styles.supportIcon}>
              <Ionicons name="chatbubbles-outline" size={26} color={Colors.peter_river_600} />
            </View>

            <Text style={styles.supportTitle}>Still need help?</Text>

            <Text style={styles.supportSubtitle}>Our support team is available 24/7 to assist you.</Text>

            <TouchableOpacity onPress={callSupport} activeOpacity={0.9} style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
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
    textAlign: "center",
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  faqSection: {
    marginBottom: 32,
  },

  faqCard: {
    backgroundColor: Colors.whiteColor,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  faqRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  faqIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  faqContent: {
    flex: 1,
  },

  faqQuestion: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    lineHeight: 22,
  },

  faqAnswer: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  supportCard: {
    backgroundColor: Colors.whiteColor,
    padding: 22,
    borderRadius: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  supportTitle: {
    marginTop: 14,
    fontSize: 17,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  supportSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
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
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },
});
