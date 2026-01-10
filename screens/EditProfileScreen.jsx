import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import { Alert, Modal, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import appStyle from "../lib/style";
const { Colors, Fonts } = appStyle;

export default function EditProfileScreen({ navigation }) {
  const { ownUser, authPostFetch } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fullName, setFullName] = useState(ownUser?.fullName || "");

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    const bodyTxt = {
      driverId: ownUser._id,
      fullName,
    };

    const res = await authPostFetch("driver/update", bodyTxt, true);
    if (res?.success) {
      navigation.goBack();
    }
  };

  if (!ownUser) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user details available.</Text>
      </SafeAreaView>
    );
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeleting(true);

      const res = await authPostFetch("driver/deleteAccount", bodyTxt, true);
      navigation.reset({
        index: 0,
        routes: [{ name: "sign-in" }],
      });
    } catch (err) {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.9} style={styles.iconButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.peter_river_600} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <View style={styles.headerSide} />
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={18} color={Colors.peter_river_600} />
              <Text style={styles.labelText}>Full Name</Text>
            </View>

            <TextInput value={fullName} onChangeText={setFullName} placeholder="Enter your full name" placeholderTextColor={Colors.concrete} style={styles.input} />
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showDeleteModal} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Delete Account</Text>

              <Text style={styles.modalDescription}>This action is permanent and cannot be undone. Are you sure you want to continue?</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowDeleteModal(false)} disabled={deleting} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={confirmDeleteAccount} disabled={deleting} style={styles.confirmButton}>
                  <Text style={styles.confirmText}>{deleting ? "Please wait..." : "Delete"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.dangerHeader}>
          <Ionicons name="warning-outline" size={16} color={Colors.alizarin_600} />
          <Text style={styles.dangerHeaderText}>Danger Zone</Text>
        </View>

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },

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

  card: {
    backgroundColor: Colors.whiteColor,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  inputGroup: {
    marginBottom: 24,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  labelText: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.asbestos,
  },

  input: {
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_400,
    borderRadius: 14,
    backgroundColor: Colors.whiteColor,
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.midnight_blue_900,
  },

  /* Buttons */
  saveButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  deleteButton: {
    marginTop: 14,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.alizarin_200,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonText: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.alizarin_600,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(23,32,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: Colors.whiteColor,
    padding: 22,
    borderRadius: 22,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    textAlign: "center",
    color: Colors.midnight_blue_900,
  },

  modalDescription: {
    marginTop: 8,
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
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.clouds_300,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_700,
  },

  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.alizarin_600,
    justifyContent: "center",
    alignItems: "center",
  },

  confirmText: {
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },
  dangerHeader: {
    marginTop: 40,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 17,
    borderRadius: 12,
    backgroundColor: Colors.alizarin_50,
  },

  dangerHeaderText: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.alizarin_700,
  },
});
