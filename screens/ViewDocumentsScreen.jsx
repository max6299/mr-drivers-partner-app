import React from "react";
import { Image, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/useAuth";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function ViewDocumentsScreen() {
  const { ownUser } = useAuth();
  const navigation = useNavigation();

  const license = ownUser?.drivingLicence;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Uploaded Documents</Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="car-outline" size={20} color={Colors.peter_river_600} />
            </View>
            <Text style={styles.cardTitle}>Driving Licence</Text>
          </View>

          {license ? (
            <>
              <View style={styles.licenceInfo}>
                <Text style={styles.licenceLabel}>Licence Number</Text>
                <Text style={styles.licenceValue}>{license.drivingLicenseNo}</Text>
              </View>

              <View style={styles.imagesRow}>
                <DocumentImage uri={license.frontImage} label="Front Side" />
                <DocumentImage uri={license.backImage} label="Back Side" />
              </View>
            </>
          ) : (
            <EmptyState text="Driving licence details not available" />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
function DocumentImage({ uri, label }) {
  return (
    <View style={styles.documentWrapper}>
      {uri ? (
        <Image source={{ uri }} style={styles.documentImage} resizeMode="cover" />
      ) : (
        <View style={styles.documentPlaceholder}>
          <Ionicons name="image-outline" size={24} color={Colors.concrete} />
          <Text style={styles.placeholderText}>No image uploaded</Text>
        </View>
      )}

      <Text style={styles.documentLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ text }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={32} color={Colors.concrete} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
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
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },

  /* Licence Info */
  licenceInfo: {
    marginBottom: 16,
  },

  licenceLabel: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  licenceValue: {
    marginTop: 4,
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },

  /* Images */
  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  documentWrapper: {
    width: "48%",
  },

  documentImage: {
    width: "100%",
    height: 176,
    borderRadius: 16,
    backgroundColor: Colors.clouds_200,
  },

  documentPlaceholder: {
    width: "100%",
    height: 176,
    borderRadius: 16,
    backgroundColor: Colors.clouds_200,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.concrete,
  },

  documentLabel: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    paddingVertical: 28,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },
});
