import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Modal, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useRide } from "../context/useRide";
import appStyle from "../lib/style";

const { Colors, Fonts } = appStyle;

export default function PaymentScreen() {
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);
  const { ridePostFetch, appInfo } = useRide();

  const navigation = useNavigation();
  const route = useRoute();
  const { rideId, origin, destination, distancekm, totalAmount } = route.params || {};

  const collectCash = async () => {
    try {
      const res = await ridePostFetch("driver/updateRide", {
        rideId,
        cashCollected: true,
      });

      if (!res?.success) {
        Toast.show({
          type: "error",
          text1: "Unable to update",
          text2: "Something went wrong",
        });
        return;
      }

      setOpenPaymentSuccess(true);
    } catch {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection.",
      });
    }
  };

  const redirectDashboard = () => {
    setOpenPaymentSuccess(false);
    navigation.navigate("dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Collect Cash</Text>
          <Text style={styles.subtitle}>Confirm payment received from the rider</Text>
        </View>

        <View style={styles.fareCard}>
          <Text style={styles.fareLabel}>Total Fare</Text>
          <Text style={styles.fareAmount}>₹ {totalAmount ? `${totalAmount}.00` : `${appInfo?.baseFare}.00 / hr`} </Text>

          <View style={styles.paymentBadge}>
            <Text style={styles.paymentBadgeText}>CASH PAYMENT</Text>
          </View>
        </View>

        <View style={styles.tripCard}>
          <View style={styles.tripSection}>
            <Text style={styles.tripLabel}>Pickup</Text>
            <Text style={styles.tripValue}>{origin}</Text>
          </View>

          {/* <View style={styles.tripSection}>
            <Text style={styles.tripLabel}>Destination</Text>
            <Text style={styles.tripValue}>{destination}</Text>
          </View> */}

          {/* <View style={styles.tripFooter}>
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text style={styles.distanceValue}>{Number(distancekm).toFixed(1)} km</Text>
          </View> */}
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={collectCash} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Cash Collected</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="fade" transparent visible={openPaymentSuccess} onRequestClose={() => setOpenPaymentSuccess(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={36} color={Colors.emerald_600} />
            </View>

            <Text style={styles.modalTitle}>Payment Received</Text>

            <Text style={styles.modalSubtitle}>You can now accept new ride requests</Text>

            <TouchableOpacity style={styles.primaryButton2} onPress={redirectDashboard}>
              <Text style={styles.primaryButtonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  /* Header */
  header: {
    marginTop: 24,
    marginBottom: 32,
  },

  title: {
    fontSize: 26,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  /* Fare */
  fareCard: {
    padding: 24,
    marginBottom: 32,
    borderRadius: 24,
    backgroundColor: Colors.peter_river_50,
    borderWidth: 1,
    borderColor: Colors.peter_river_200,
    alignItems: "center",
  },

  fareLabel: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  fareAmount: {
    marginTop: 8,
    fontSize: 40,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
    letterSpacing: -1,
  },

  paymentBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.emerald_50,
  },

  paymentBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.emerald_700,
  },

  /* Trip */
  tripCard: {
    padding: 20,
    marginBottom: 32,
    backgroundColor: Colors.whiteColor,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
    borderRadius: 24,
    borderColor: "#E5E4E2",
  },

  tripSection: {
    marginBottom: 16,
  },

  tripLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    letterSpacing: 0.8,
  },

  tripValue: {
    marginTop: 4,
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },

  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.clouds_300,
  },

  distanceLabel: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  distanceValue: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },

  /* Button */
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
  },
  primaryButton2: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
  },

  primaryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(23,32,42,0.5)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.emerald_50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
    textAlign: "center",
  },

  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    textAlign: "center",
    marginBottom: 24,
  },
});
