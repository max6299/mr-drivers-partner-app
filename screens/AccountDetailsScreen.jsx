import React from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function AccountDetailsScreen({ navigation }) {
  const { ownUser } = useAuth();

  if (!ownUser) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user details available.</Text>
      </SafeAreaView>
    );
  }

  const formatBoolean = (value) => (value ? "Yes" : "No");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          {/* Left */}
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
            </TouchableOpacity>
          </View>

          {/* Center */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Account Details</Text>
            <Text style={styles.headerSubtitle}>View and manage your profile information</Text>
          </View>

          {/* Right */}
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.navigate("edit-profile")} activeOpacity={0.9} style={styles.iconButton}>
              <Feather name="edit" size={18} color={Colors.peter_river_600} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <DetailRow icon="person-outline" label="Full Name" value={ownUser.fullName} />

          <DetailRow icon="call-outline" label="Mobile Number" value={ownUser.mobileNumber} />

          <DetailRow icon="checkmark-done-outline" label="Verified Mobile" value={formatBoolean(ownUser.isMobileVerified)} />

          <DetailRow icon="shield-checkmark-outline" label="Verified Account" value={formatBoolean(ownUser.isVerified)} />

          <DetailRow icon="car-outline" label="Acting Driver" value={formatBoolean(ownUser.isActingDriver)} />

          <DetailRow icon="time-outline" label="Created At" value={new Date(ownUser.createdAt).toLocaleString()} />

          <DetailRow icon="refresh-outline" label="Last Updated" value={new Date(ownUser.updatedAt).toLocaleString()} isLast />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value, isLast }) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailDivider]}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={Colors.peter_river_600} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bodyBackColor,
  },

  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  /* Header */
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

  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
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

  detailsCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
  },

  detailDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.clouds_300,
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  detailValue: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    lineHeight: 22,
  },
});
