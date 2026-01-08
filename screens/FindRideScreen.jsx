import { Entypo, MaterialIcons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { getApp } from "@react-native-firebase/app";
import { doc, getFirestore, onSnapshot } from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Modal, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useRide } from "../context/useRide";
import DragableMap from "../components/DragableMap";
import CompleteRideConfirmation from "../components/CompleteRideConfirmation";
import { rideFarePerHour } from "../constants/data";
import Navbar from "../components/Navbar";
import { StyleSheet } from "react-native";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function FindRideScreen() {
  const { ownUser } = useAuth();
  const { coords, setCoords, currentLocation, setCurrentLocation, isLoading, timerRef, setIsLoading, startTimer, stopTimer, permissionAsked, setPermissionAsked, assignedRides, setAssignedRides, ongoingRide, setOngoingRide, currentRide, setCurrentRide, ridePostFetch, setStartTime, setEndTime, elapsed, setElapsed, otp, setOtp, mapboxDirections, formatTime } = useRide();
  const navigation = useNavigation();

  const [openArrivalInfo, setOpenArrivalInfo] = useState(false);
  const [openStartRide, setOpenStartRide] = useState(false);

  const [hasArrived, setHasArrived] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [ongoingModal, setOngoingModal] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);

  const [openCompleteRide, setOpenCompleteRide] = useState(false);

  const mapRef = useRef();
  const cameraRef = useRef(null);

  const db = getFirestore(getApp());

  const CELL_COUNT = 4;
  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const getDirections = async (destination) => {
    if (!destination || !currentLocation) {
      console.warn("Missing destination or current location");
      return;
    }
    try {
      setSelectedDestination(destination);
      const routes = await mapboxDirections({
        origin: currentLocation,
        destination,
      });
      if (routes?.length) {
        setCoords(routes);
      }
    } catch (error) {
      console.error("Route fetch error:", error.message);
    }
  };

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["4%", "40%", "60%", "90%"], []);

  useEffect(() => {
    if (sheetReady && assignedRides?.length > 0 && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(1);
    }
  }, [assignedRides, sheetReady]);

  const acceptRide = async () => {
    try {
      const bodyTxt = {
        rideId: currentRide.rideId,
        status: "ongoing",
      };

      const res = await ridePostFetch("driver/updateRide", bodyTxt);
      console.log(res);

      if (!res.success) {
        throw new Error(res.message || "Failed to update ride");
      }
      setAssignedRides((prev) => prev.filter((ride) => ride._id !== res.ride._id));

      const updatedRide = res.ride;

      const bodyTxt1 = {
        rideId: updatedRide.rideId,
        userId: updatedRide.userId,
        driverId: updatedRide.driverId,
      };

      const res1 = await ridePostFetch("driver/start", bodyTxt1);
      console.log(res1);

      if (!res1.success) {
        throw new Error("Failed to start ride");
      }
      setOngoingRide(updatedRide);

      getDirections(updatedRide.destination);
      // await startLiveTracking();
    } catch (err) {
      console.error("Accept ride error:", err);

      Toast.show({
        type: "error",
        text1: "Unable to start ride",
        text2: err.message || "Please try again",
      });
    }
  };

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.15, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  const HandleIndicator = ({ onPress }) => {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ width: "100%" }}>
        <View
          style={{
            width: "100%",
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 90,
              height: 4,
              borderRadius: 10,
              backgroundColor: "#9CA3AF",
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const verifyOtp = async () => {
    if (otp.length !== 4) {
      Toast.show({
        type: "error",
        text1: "Invalid OTP",
        text2: "Please enter a 4 digit OTP",
      });
      return;
    }

    const bodyTxt = {
      rideId: currentRide.rideId,
      otp,
    };

    try {
      const res = await ridePostFetch("driver/verifyRideOtp", bodyTxt);
      console.log(res);

      if (res.success) {
        setOtpModal(false);
        setOtp(null);
        acceptRide();
      } else {
        Toast.show({
          type: "error",
          text1: "Incorrect OTP",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error verifying OTP",
      });
    }
  };

  useEffect(() => {
    if (!ongoingRide?.rideId) return;

    const rideRef = doc(db, "rides", ongoingRide.rideId);

    const unsub = onSnapshot(rideRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();

      if (data.status === "ongoing" && data.rideStartTime) {
        const startMs = data.rideStartTime.toDate().getTime();

        setStartTime(startMs);
        startTimer(startMs);
      }

      if (data.status === "completed" && data.rideEndTime) {
        stopTimer();

        const endMs = data.rideEndTime.toDate().getTime();
        setEndTime(endMs);

        setElapsed(Math.floor((endMs - data.rideStartTime.toDate().getTime()) / 1000));
      }
    });

    return () => {
      unsub();
      stopTimer();
    };
  }, [ongoingRide?.rideId]);

  const completeRide = async (ongoingRide) => {
    try {
      const bodyTxt = { rideId: ongoingRide?.rideId, userId: ongoingRide?.userId, driverId: ongoingRide?.driverId };

      const res = await ridePostFetch("driver/end", bodyTxt);

      if (!res?.success) {
        throw new Error("Failed to complete ride");
      }

      navigation.navigate("payment", { rideId: ongoingRide?.rideId, userId: ongoingRide?.userId, totalAmount: res.ride.totalAmount, origin: ongoingRide.origin.name, destination: ongoingRide.destination.name, distancekm: ongoingRide.distancekm });

      setOpenCompleteRide(false);
      setOngoingModal(false);
      setElapsed(0);
      setStartTime(null);
      setEndTime(null);
      setCoords(null);
      setOngoingRide(null);
      setSelectedDestination(null);
      stopTimer();
    } catch (err) {
      console.error("Complete ride error:", err);

      Toast.show({
        type: "error",
        text1: "Unable to complete ride",
        text2: "Please try again",
      });
    }
  };

  useEffect(() => {
    if (coords?.length >= 2 && cameraRef.current) {
      const longitudes = coords.map((c) => c[0]);
      const latitudes = coords.map((c) => c[1]);

      const ne = [Math.max(...longitudes), Math.max(...latitudes)];

      const sw = [Math.min(...longitudes), Math.min(...latitudes)];

      cameraRef.current.fitBounds(
        ne,
        sw,
        70, // padding
        1000 // animation duration
      );
    }
  }, [coords]);

  const sendOTP = async (ride) => {
    try {
      setCurrentRide(ride);

      const bodyTxt = {
        rideId: ride.rideId,
        userId: ride.userId,
      };

      const res = await ridePostFetch("driver/sendOtp", bodyTxt);

      if (res?.success) {
        setOtpModal(true);

        Toast.show({
          type: "success",
          text1: "OTP sent successfully",
          text2: "Please ask the passenger to verify it.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to send OTP",
          text2: "Please try again.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Please check your internet connection.",
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <StatusBar backgroundColor="#61dafb" barStyle="dark-content" />

        <View style={styles.header}>
          <Navbar navigation={navigation} />
        </View>

        <View style={styles.mapWrapper}>
          <DragableMap destination={selectedDestination} cameraRef={cameraRef} />
        </View>

        <BottomSheet ref={bottomSheetRef} index={0} snapPoints={snapPoints} enablePanDownToClose={false} backgroundStyle={styles.sheetBackground} onChange={() => setSheetReady(true)} handleComponent={() => <HandleIndicator onPress={() => bottomSheetRef?.current?.snapToIndex(1)} />} overDragResistanceFactor={2} animateOnMount>
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
            {assignedRides?.length > 0 ? (
              assignedRides.map((ride, index) => (
                <View key={ride._id} style={styles.rideCard}>
                  <View style={styles.rideHeader}>
                    <Text style={styles.rideTitle}>Ride Request #{index + 1}</Text>

                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Entypo name="location" size={12} color="#0193e0" />
                        <Text style={styles.badgeText}>{Number(ride.distancekm).toFixed(1)} km</Text>
                      </View>

                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{ride.status === "accepted" ? "Waiting" : ride.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.sectionRow}>
                    <View style={styles.primaryLine} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionTitle}>Passenger Location</Text>

                      <View style={styles.locationRow}>
                        <View style={styles.iconBoxBlue}>
                          <Entypo name="location-pin" size={16} color="#0193e0" />
                        </View>
                        <Text style={styles.locationText}>{ride.origin?.name}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.sectionRow}>
                    <View style={styles.successLine} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionTitle}>Destination</Text>

                      <View style={styles.locationRow}>
                        <View style={styles.iconBoxGreen}>
                          <Entypo name="location-pin" size={16} color="#16a34a" />
                        </View>
                        <Text style={styles.locationText}>{ride.destination.name}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => getDirections(ride.destination)} style={styles.btnPrimaryRow}>
                      <Entypo name="direction" size={18} color="#fff" />
                      <Text style={styles.btnPrimaryRowText}>Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity disabled={ongoingRide !== null} onPress={() => sendOTP(ride)} style={[styles.secondaryButton, ongoingRide && styles.disabledButton]}>
                      <Entypo name="key" size={18} color={ongoingRide ? "#9ca3af" : "#374151"} />
                      <Text style={[styles.secondaryButtonText, ongoingRide && styles.disabledText]}>Start Ride</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="directions-car" size={36} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No rides available</Text>
                <Text style={styles.emptySubtitle}>New requests will appear here</Text>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>

        <Modal visible={otpModal} transparent animationType="fade" onRequestClose={() => setOtpModal(false)}>
          <View style={styles.modalOverlayDark}>
            <View style={styles.otpModal}>
              <Text style={styles.otpTitle}>Verify Ride</Text>
              <Text style={styles.otpSubtitle}>Enter the OTP shared by the passenger</Text>

              <View style={styles.otpFieldWrapper}>
                <CodeField
                  ref={ref}
                  {...props}
                  value={otp}
                  onChangeText={setOtp}
                  cellCount={CELL_COUNT}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  renderCell={({ index, symbol, isFocused }) => (
                    <View key={index} onLayout={getCellOnLayoutHandler(index)} style={[styles.otpCell, isFocused && styles.otpCellFocused]}>
                      <Text style={styles.otpCellText}>{symbol || (isFocused ? <Cursor /> : null)}</Text>
                    </View>
                  )}
                />
              </View>

              <TouchableOpacity style={styles.btnPrimarySolid} onPress={verifyOtp}>
                <Text style={styles.btnPrimarySolidText}>Verify & Start Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelSoftButton}
                onPress={() => {
                  setOtpModal(false);
                  setCurrentRide(null);
                }}
              >
                <Text style={styles.cancelSoftText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {ongoingRide && (
          <Animated.View style={[styles.floatingButton, animatedStyle]}>
            <TouchableOpacity onPress={() => setOngoingModal(true)} style={styles.floatingButtonInner}>
              <MaterialIcons name="directions-car" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <Modal visible={ongoingModal} transparent animationType="slide" onRequestClose={() => setOngoingModal(false)}>
          <View style={styles.modalOverlayDark}>
            <View style={styles.ongoingModal}>
              <View style={styles.dragHandle} />

              <View style={styles.rideTimeCard}>
                <Text style={styles.rideTimeLabel}>Ride Time</Text>
                <Text style={styles.rideTimeValue}>{formatTime(elapsed)}</Text>

                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>● ACTIVE</Text>
                </View>
              </View>

              <View style={styles.locationCard}>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationValue}>{ongoingRide?.origin?.name}</Text>
              </View>

              <View style={styles.locationCard}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationValue}>{ongoingRide?.destination?.name}</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Fare</Text>
                  <Text style={styles.infoValue}>₹ {rideFarePerHour} / hr</Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{ongoingRide?.distance_km?.toFixed(1)} km</Text>
                </View>
              </View>

              <CompleteRideConfirmation elapsed={elapsed} visible={openCompleteRide} onClose={() => setOpenCompleteRide(false)} onConfirm={() => completeRide(ongoingRide)} />

              <TouchableOpacity style={styles.btnSuccessSolid} onPress={() => setOpenCompleteRide(true)}>
                <Text style={styles.btnSuccessSolidText}>Complete Ride</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  getDirections(ongoingRide?.destination);
                  setOngoingModal(false);
                }}
              >
                <Text style={styles.primaryButtonText}>View Route</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelSoftButton} onPress={() => setOngoingModal(false)}>
                <Text style={styles.cancelSoftText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    padding: 16,
    gap: 20,
  },

  mapWrapper: {
    flex: 1,
    padding: 8,
  },

  sheetBackground: {
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },

  sheetContent: {
    padding: 16,
  },

  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
  },

  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  rideTitle: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "interSemiBold",
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    gap: 4,
  },

  badgeText: {
    fontSize: 12,
    color: "#2563eb",
    fontFamily: "interSemiBold",
  },

  sectionRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  primaryLine: {
    width: 4,
    borderRadius: 4,
    backgroundColor: "#0193e0",
    marginRight: 12,
  },

  successLine: {
    width: 4,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "interBold",
  },

  locationRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  locationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#1f2937",
    fontFamily: "interSemiBold",
  },

  iconBoxBlue: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  iconBoxGreen: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    gap: 8,
  },

  disabledButton: {
    backgroundColor: "#f3f4f6",
  },

  secondaryButtonText: {
    fontSize: 16,
    color: "#374151",
    fontFamily: "interSemiBold",
  },

  disabledText: {
    color: "#9ca3af",
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    marginTop: 40,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#6b7280",
    fontFamily: "interSemiBold",
  },

  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#9ca3af",
    fontFamily: "interMedium",
  },

  modalOverlayLight: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  modalOverlayDark: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  startRideModal: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 22,
    textAlign: "center",
    color: "#1f2937",
    fontFamily: "interSemiBold",
  },

  modalSubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#6b7280",
  },

  otpModal: {
    width: "92%",
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 24,
  },

  otpTitle: {
    fontSize: 22,
    textAlign: "center",
    fontFamily: "interBold",
    color: "#111827",
  },

  otpSubtitle: {
    marginTop: 8,
    textAlign: "center",
    color: "#6b7280",
  },

  otpFieldWrapper: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: "center",
  },

  otpCell: {
    width: 56,
    height: 56,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  otpCellFocused: {
    backgroundColor: "#eff6ff",
    borderColor: "#0193e0",
    borderWidth: 2,
  },

  otpCellText: {
    fontSize: 20,
    color: "#111827",
    fontFamily: "interSemiBold",
  },

  floatingButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
  },

  floatingButtonInner: {
    backgroundColor: "#0193e0",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  ongoingModal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 40,
  },

  dragHandle: {
    width: 56,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 20,
  },

  rideTimeCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    marginBottom: 20,
  },

  rideTimeLabel: {
    fontSize: 14,
    color: "#0193e0",
    fontFamily: "interMedium",
  },

  rideTimeValue: {
    fontSize: 52,
    fontFamily: "interBold",
    color: "#111827",
  },

  activeBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#dcfce7",
    borderRadius: 999,
  },

  activeBadgeText: {
    fontSize: 12,
    color: "#15803d",
    fontFamily: "interSemiBold",
  },

  locationCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    marginBottom: 12,
  },

  locationLabel: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
  },

  locationValue: {
    marginTop: 4,
    fontSize: 18,
    color: "#111827",
    fontFamily: "interSemiBold",
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },

  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 20,
    fontFamily: "interBold",
    color: "#111827",
  },

  outlineButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },

  outlineButtonText: {
    color: "#374151",
    fontFamily: "interSemiBold",
  },

  cancelSoftButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    marginTop: 8,
  },

  cancelSoftText: {
    color: "#6b7280",
    fontFamily: "interSemiBold",
  },

  btnPrimaryRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#0193e0",
    gap: 8,
  },

  btnPrimaryRowText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "interBold",
  },

  btnPrimarySolid: {
    backgroundColor: "#0193e0",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  btnPrimarySolidText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "interBold",
  },

  btnSuccessSolid: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#0193e0",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "interBold",
  },

  btnSuccessSolidText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "interBold",
  },
});
