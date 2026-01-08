import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Modal, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PaymentScreen() {
  const [openPaymentSuccess, setOpenPaymentSuccess] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { rideId, origin, destination, distancekm } = route.params || {};

  const collectCash = async () => {
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/driver/updateRide`, { rideId, cashCollected: true });

      if (!res.data.success) {
        Toast.show({
          type: "error",
          text1: "Unable to update",
          text2: res.data.message || "Something went wrong",
        });
        return;
      }

      const ride = res.data.ride;

      await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}/driver/payment`, {
        rideId: ride.rideId,
        userId: ride.userId,
        driverId: ride.driverId,
      });

      setOpenPaymentSuccess(true);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your internet connection.",
      });
    }
  };

  useEffect(() => {
    return () => {};
  }, []);

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

          {/* <Text style={styles.fareAmount}>₹ {(elapsed)}.00</Text> */}

          <View style={styles.paymentBadgeWrapper}>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>CASH PAYMENT</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripCard}>
          <View style={styles.tripSection}>
            <Text style={styles.tripLabel}>Pickup</Text>
            <Text style={styles.tripValue}>{origin}</Text>
          </View>

          <View style={styles.tripSection}>
            <Text style={styles.tripLabel}>Drop</Text>
            <Text style={styles.tripValue}>{destination}</Text>
          </View>

          <View style={styles.tripFooter}>
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text style={styles.distanceValue}>{Number(distancekm).toFixed(1)} KM</Text>
          </View>
        </View>

        {/* Action */}
        <TouchableOpacity activeOpacity={0.85} onPress={collectCash} style={styles.collectButton}>
          <Text style={styles.collectButtonText}>Cash Collected</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal animationType="fade" transparent={false} visible={openPaymentSuccess} onRequestClose={() => setOpenPaymentSuccess(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.successIconWrapper}>
              <Ionicons name="checkmark" size={36} color="#22C55E" />
            </View>

            <Text style={styles.modalTitle}>Payment Received</Text>

            <Text style={styles.modalSubtitle}>You can now accept new ride requests</Text>

            <View style={styles.modalButtonWrapper}>
              <TouchableOpacity style={styles.collectButton} onPress={() => navigation.navigate("dashboard")}>
                <Text style={styles.collectButtonText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  /* Main */
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    fontSize: 30,
    textAlign: "center",
    color: "#111827",
    fontFamily: "interBold",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "interMedium",
  },

  /* Fare Card */
  fareCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: "rgba(1,147,224,0.1)",
    borderRadius: 24,
  },
  fareLabel: {
    fontSize: 14,
    textAlign: "center",
    color: "#4B5563",
    fontFamily: "interMedium",
  },
  fareAmount: {
    marginTop: 8,
    fontSize: 44,
    textAlign: "center",
    color: "#111827",
    fontFamily: "interBold",
    letterSpacing: -1,
  },
  paymentBadgeWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
  },
  paymentBadgeText: {
    fontSize: 12,
    color: "#15803D",
    fontFamily: "interSemiBold",
  },

  /* Trip Card */
  tripCard: {
    padding: 20,
    marginBottom: 32,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
  },
  tripSection: {
    marginBottom: 16,
  },
  tripLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6B7280",
    fontFamily: "interMedium",
  },
  tripValue: {
    marginTop: 4,
    fontSize: 16,
    color: "#111827",
    fontFamily: "interSemiBold",
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  distanceLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "interMedium",
  },
  distanceValue: {
    fontSize: 14,
    color: "#111827",
    fontFamily: "interSemiBold",
  },

  /* Button */
  collectButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: PRIMARY,
  },
  collectButtonText: {
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
    fontFamily: "interBold",
  },

  /* Modal */
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 30,
    textAlign: "center",
    color: "#111827",
    fontFamily: "interBold",
  },
  modalSubtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "interMedium",
  },
  modalButtonWrapper: {
    width: "100%",
    marginTop: 40,
  },
});
