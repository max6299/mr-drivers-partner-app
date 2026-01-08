import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, Image, Modal, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import { menuItems, user } from "../constants/data";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { ownUser, setOwnUser, mrDriverPartnerLogout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    mrDriverPartnerLogout();
    setModalVisible(false);
  };

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate(item.route)} activeOpacity={0.85} style={styles.menuItem}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrapper}>
          <Ionicons name={item.icon} size={20} color={PRIMARY} />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.screenSubtitle}>View and manage your personal information</Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: ownUser?.profilePicture || user.profilePicture,
                }}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.userName}>{ownUser?.fullName}</Text>

            <View style={styles.statusBadge}>
              <Ionicons name={ownUser?.isVerified ? "checkmark-circle" : "close-circle"} size={16} color={ownUser?.isVerified ? PRIMARY : "#EF4444"} />
              <Text style={[styles.statusText, ownUser?.isVerified ? styles.verified : styles.notVerified]}>{ownUser?.isVerified ? "Verified Driver" : "Not Verified"}</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85} style={styles.logoutItem}>
            <View style={styles.menuLeft}>
              <View style={styles.logoutIconWrapper}>
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#EF4444" />
          </TouchableOpacity>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalSubtitle}>You’ll need to log in again to access your account.</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "interBold",
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "interMedium",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* Header */
  profileHeader: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 32,
  },

  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },

  userName: {
    marginTop: 14,
    fontSize: 22,
    color: "#0F172A",
    fontFamily: "interSemiBold",
    letterSpacing: -0.2,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  statusText: {
    fontSize: 13,
    fontFamily: "interMedium",
  },

  verified: {
    color: PRIMARY,
  },

  notVerified: {
    color: "#EF4444",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  menuTitle: {
    fontSize: 15,
    color: "#0F172A",
    fontFamily: "interMedium",
  },

  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#F1F5F9",
    marginTop: 4,
  },

  logoutIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    fontSize: 15,
    color: "#DC2626",
    fontFamily: "interMedium",
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "82%",
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#0F172A",
    fontFamily: "interSemiBold",
  },

  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#64748B",
    fontFamily: "interRegular",
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
  },

  cancelText: {
    textAlign: "center",
    color: "#334155",
    fontFamily: "interMedium",
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#EF4444",
    borderRadius: 14,
  },

  confirmText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "interSemiBold",
  },
});
