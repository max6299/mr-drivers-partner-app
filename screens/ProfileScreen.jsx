import React, { useState } from "react";
import { FlatList, Image, Modal, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/useAuth";
import { menuItems, user } from "../constants/data";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { ownUser, mrDriverPartnerLogout, rating, totalRatings } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const handleLogout = async () => {
    mrDriverPartnerLogout();
    setModalVisible(false);
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.92} style={styles.menuItem} onPress={() => navigation.navigate(item.route)}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrapper}>
          <Ionicons name={item.icon} size={20} color={Colors.peter_river_600} />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={Colors.concrete} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.screenSubtitle}>Manage your account & preferences</Text>
      </View>

      <FlatList
        data={menuItems}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderMenuItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileCard}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: ownUser?.profilePictureFull,
                }}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.userName}>{ownUser?.fullName}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>{rating === 0 ? "⭐ No ratings yet" : `⭐ ${rating}`}</Text>

              {rating !== 0 && (
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 13,
                    color: "#6B7280",
                  }}
                >
                  ({totalRatings} ratings)
                </Text>
              )}
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: ownUser?.isVerified ? Colors.emerald_50 : Colors.alizarin_50,
                },
              ]}
            >
              <Ionicons name={ownUser?.isVerified ? "checkmark-circle" : "close-circle"} size={16} color={ownUser?.isVerified ? Colors.emerald_600 : Colors.alizarin_600} />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: ownUser?.isVerified ? Colors.emerald_700 : Colors.alizarin_600,
                  },
                ]}
              >
                {ownUser?.isVerified ? "Verified Driver" : "Not Verified"}
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity activeOpacity={0.92} style={styles.logoutItem} onPress={() => setModalVisible(true)}>
            <View style={styles.menuLeft}>
              <View style={styles.logoutIconWrapper}>
                <Ionicons name="log-out-outline" size={20} color={Colors.alizarin_600} />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={Colors.alizarin_600} />
          </TouchableOpacity>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalSubtitle}>You’ll need to log in again to access your account.</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={handleLogout}>
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  screenTitle: {
    fontSize: 26,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  profileCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 0.5,
  },

  avatarWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.clouds_200,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  userName: {
    marginTop: 14,
    fontSize: 22,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
    gap: 6,
  },

  statusText: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.whiteColor,
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
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
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.whiteColor,
    padding: 16,
    borderRadius: 18,
    marginTop: 6,
  },

  logoutIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.alizarin_50,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.alizarin_600,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(23,32,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "82%",
    backgroundColor: Colors.whiteColor,
    borderRadius: 22,
    padding: 22,
  },

  modalTitle: {
    fontSize: 18,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.clouds_300,
    borderRadius: 14,
  },

  cancelText: {
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_700,
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.alizarin_600,
    borderRadius: 14,
  },

  confirmText: {
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },
});
