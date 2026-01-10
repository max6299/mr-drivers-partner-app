import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenGradient from "../components/ScreenGradient";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

const LegalPagesScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerRow}>
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Legal</Text>
          <Text style={styles.headerSubtitle}>Terms & privacy information</Text>
        </View>

        <View style={styles.headerSide} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.92} style={styles.menuItem} onPress={() => navigation.navigate("terms-profile")}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="document-text-outline" size={20} color={Colors.peter_river_600} />
            </View>
            <Text style={styles.menuTitle}>Terms & Conditions</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={Colors.concrete} />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.92} style={styles.menuItem} onPress={() => navigation.navigate("privacy-policy")}>
          <View style={styles.menuLeft}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.peter_river_600} />
            </View>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={Colors.concrete} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LegalPagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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

  /* Content */
  content: {
    paddingHorizontal: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.whiteColor,
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  menuIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  menuTitle: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },
});
