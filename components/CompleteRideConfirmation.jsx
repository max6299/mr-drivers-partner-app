import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRide } from "../context/useRide";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function CompleteRideConfirmation({ visible, onClose, onConfirm, elapsed }) {
  const { formatTime } = useRide();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Ionicons name="flag-outline" size={18} color={Colors.emerald_600} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Complete Ride</Text>

          {/* Description */}
          <Text style={styles.description}>This will stop the ride timer and proceed to payment collection.</Text>

          {/* Time */}
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Total Ride Time</Text>
            <Text style={styles.timeValue}>{formatTime(elapsed)}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity activeOpacity={0.9} onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Complete Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23,32,42,0.5)",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "100%",
    backgroundColor: Colors.whiteColor,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,

    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  iconWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.emerald_50,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  timeCard: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
    backgroundColor: Colors.clouds_100,
    alignItems: "center",
  },

  timeLabel: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  timeValue: {
    marginTop: 4,
    fontSize: 32,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
    letterSpacing: -0.5,
  },

  actions: {
    marginTop: 24,
    gap: 12,
  },

  confirmButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.emerald_600,
    alignItems: "center",
  },

  confirmText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  cancelButton: {
    paddingVertical: 10,
    alignItems: "center",
  },

  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.asbestos,
  },
});
