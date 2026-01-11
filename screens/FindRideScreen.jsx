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
import { Colors, Fonts } from "../lib/style";

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
  const { coords, currentLocation, 
    startTimer, stopTimer, assignedRides, 
    ongoingRide, updateOngoingRide, currentRide, 
    ridePostFetch, elapsed, mapboxDirections, formatTime, 
    appInfo, updateCurrentRide, updateAssingedRide, 
    updateStartTime, updateElapsed, updateEndTime, updateCoords } = useRide();

  const navigation = useNavigation();

  const [hasArrived, setHasArrived] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [ongoingModal, setOngoingModal] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [sheetReady, setSheetReady] = useState(false);
  const [otp, setOtp] = useState(null);

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
        updateCoords(routes);
      }
    } catch (error) {
      console.error("Route fetch error:", error.message);
    }
  };

  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ["10%", "35%", "60%", "90%"], []);

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

      if (!res.success) {
        throw new Error(res.message || "Failed to update ride");
      }
      updateAssingedRide((prev) => prev.filter((ride) => ride._id !== res.ride._id));

      const updatedRide = res.ride;

      const bodyTxt1 = {
        rideId: updatedRide.rideId,
        userId: updatedRide.userId,
        driverId: updatedRide.driverId,
      };

      const res1 = await ridePostFetch("driver/start", bodyTxt1);

      if (!res1.success) {
        throw new Error("Failed to start ride");
      }
      updateOngoingRide(updatedRide);

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
              backgroundColor: "#fff",
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

        updateStartTime(startMs);
        startTimer(startMs);
      }

      if (data.status === "completed" && data.rideEndTime) {
        stopTimer();

        const endMs = data.rideEndTime.toDate().getTime();
        updateEndTime(endMs);

        updateElapsed(Math.floor((endMs - data.rideStartTime.toDate().getTime()) / 1000));
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

      navigation.navigate("payment", { rideId: ongoingRide?.rideId, 
        userId: ongoingRide?.userId, totalAmount: res.ride.totalAmount, origin: ongoingRide?.origin?.name, 
        destination: ongoingRide?.destination?.name, distancekm: ongoingRide?.distancekm, 
        rideStartTime : ongoingRide?.rideStartTime, rideEndTime : ongoingRide?.rideEndTime,
        carModel : ongoingRide?.car.model, carTransmisssion : ongoingRide?.car.transmission
      });

      setOpenCompleteRide(false);
      setOngoingModal(false);
      updateElapsed(0);
      updateStartTime(null);
      updateEndTime(null);
      updateCoords(null);
      updateOngoingRide(null);
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
      updateCurrentRide(ride);

      const bodyTxt = {
        rideId: ride.rideId,
        userId: ride.userId,
      };

      const res = await ridePostFetch("driver/sendRideOtp", bodyTxt);

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
            <View style={{ backgroundColor: "#EEF2F7", borderRadius: 20 }}>
              <TouchableOpacity onPress={() => bottomSheetRef.current.snapToIndex(1)} style={{ alignItems: "center" }}>
                <Text style={{ textAlign: "center", marginVertical: 12, fontSize: 14, lineHeight: 20, color: "#000", fontFamily: Fonts.GoogleSansFlex, fontWeight: "500", letterSpacing: 0.2 }}>Track your Ride Request Here</Text>
              </TouchableOpacity>

              {assignedRides?.length > 0 ? (
                assignedRides.map((ride, index) => (
                  <View key={ride._id} style={styles.rideCard}>
                    <View style={styles.rideHeader}>
                      <Text style={styles.rideTitle}>Ride Request #{index + 1}</Text>

                      <View style={styles.badgeRow}>
                        {/* <View style={styles.badge}>
                          <Entypo name="location" size={12} color="#0193e0" />
                          <Text style={styles.badgeText}>{Number(ride.distancekm).toFixed(1)} km</Text>
                        </View> */}

                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{ride.status === "accepted" ? "Waiting" : ride.status}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.sectionRow}>
                      <View style={styles.primaryLine} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Passenger Start Location</Text>

                        <View style={styles.locationRow}>
                          <View style={styles.iconBoxBlue}>
                            <Entypo name="location-pin" size={16} color="#0193e0" />
                          </View>
                          <Text style={styles.locationText}>{ride?.origin?.name}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.sectionRow}>
                      <View style={styles.successLine} />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#374151",
                            marginVertical: 6,
                            fontWeight: "500",
                          }}
                        >
                          Date: <Text style={{ fontWeight: "400", color: "#6B7280" }}>{ride?.startDate}</Text>
                        </Text>

                        <Text
                          style={{
                            fontSize: 14,
                            color: "#374151",
                            marginVertical: 6,
                            fontWeight: "500",
                          }}
                        >
                          Time: <Text style={{ fontWeight: "400", color: "#6B7280" }}>{ride?.startTime}</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#374151",
                            marginVertical: 6,
                            fontWeight: "500",
                          }}
                        >
                          Car Model: <Text style={{ fontWeight: "400", color: "#6B7280" }}>{ride?.car?.model}</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#374151",
                            marginVertical: 6,
                            fontWeight: "500",
                          }}
                        >
                          Transmission: <Text style={{ fontWeight: "400", color: "#6B7280" }}>{ride?.car?.transmission}</Text>
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#374151",
                            marginVertical: 6,
                            fontWeight: "500",
                          }}
                        >
                          Estimated Time: <Text style={{ fontWeight: "400", color: "#6B7280" }}>{ride?.driverWorkingHours}hrs</Text>
                        </Text>
                        {/* <Text style={styles.sectionTitle}>Destination</Text>

                        <View style={styles.locationRow}>
                          <View style={styles.iconBoxGreen}>
                            <Entypo name="location-pin" size={16} color="#16a34a" />
                          </View>
                          <Text style={styles.locationText}>{ride?.destination?.name || "Ask the passenger for the destination"}</Text>
                        </View> */}
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      {ride?.destination && (
                        <TouchableOpacity
                          onPress={() => {
                            bottomSheetRef?.current?.snapToIndex(0);
                            getDirections(ride.destination);
                          }}
                          style={styles.btnPrimaryRow}
                        >
                          <Entypo name="direction" size={18} color="#fff" />
                          <Text style={styles.btnPrimaryRowText}>Directions</Text>
                        </TouchableOpacity>
                      )}

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
            </View>
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
                      {symbol ? (
                        <Text style={styles.otpCellText}>{symbol}</Text>
                      ) : isFocused ? (
                        <Text style={styles.otpCellText}>
                          <Cursor />
                        </Text>
                      ) : null}
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
                  updateCurrentRide(null);
                }}
              >
                <Text style={styles.cancelSoftText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {ongoingRide && (
          <View
            style={{
              position: "absolute",
              bottom: 110,
              right: 20,
              zIndex: 100,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <MaterialIcons name="access-time" size={14} color="#6B7280" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    fontSize: 16,
                    color: "#111827",
                    fontFamily: "interSemiBold",
                  }}
                >
                  {formatTime(elapsed)}
                </Text>
              </View>
            </View>

            <Animated.View style={animatedStyle}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setOngoingModal(true)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#0193e0",
                  alignItems: "center",
                  justifyContent: "center",

                  shadowColor: "#0193e0",
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 6,
                }}
              >
                <MaterialIcons name="directions-car" size={26} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <Modal visible={ongoingModal} transparent animationType="slide" onRequestClose={() => setOngoingModal(false)}>
          <View style={styles.modalOverlayDarkOngoing}>
            <View style={styles.ongoingModalCard}>
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

              {/* <View style={styles.locationCard}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationValue}>{ongoingRide?.destination?.name || "Ask the passenger for the destination"}</Text>
              </View> */}

              <View style={styles.row}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Fare</Text>
                  <Text style={styles.infoValue}>₹ {appInfo?.baseFare} / hr</Text>
                </View>

                {/* <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Distance</Text>
                  <Text style={styles.infoValue}>{ongoingRide?.distance_km?.toFixed(1) || "0.00"} km</Text>
                </View> */}
              </View>

              <CompleteRideConfirmation elapsed={elapsed} visible={openCompleteRide} onClose={() => setOpenCompleteRide(false)} onConfirm={() => completeRide(ongoingRide)} />

              <TouchableOpacity style={styles.btnSuccessSolid} onPress={() => setOpenCompleteRide(true)}>
                <Text style={styles.btnSuccessSolidText}>Complete Ride</Text>
              </TouchableOpacity>
              {ongoingRide?.destination && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    getDirections(ongoingRide?.destination);
                    setOngoingModal(false);
                  }}
                >
                  <Text style={styles.primaryButtonText}>View Route</Text>
                </TouchableOpacity>
              )}

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

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },

  mapWrapper: {
    flex: 1,
    padding: 8,
  },

  sheetBackground: {
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E5E4E2",
    backgroundColor: "#8FD3FF",
  },

  sheetContent: {
    margin: 16,
  },

  /* Ride Card */
  rideCard: {
    backgroundColor: Colors.whiteColor,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  rideTitle: {
    fontSize: 17,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: Colors.peter_river_50,
    gap: 6,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.peter_river_700,
  },

  /* Sections */
  sectionRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  primaryLine: {
    width: 3,
    borderRadius: 3,
    backgroundColor: Colors.peter_river_600,
    marginRight: 12,
  },

  successLine: {
    width: 3,
    borderRadius: 3,
    backgroundColor: Colors.emerald_600,
    marginRight: 12,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
  },

  locationRow: {
    flexDirection: "row",
    marginTop: 8,
    alignItems: "center",
  },

  locationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
    color: Colors.midnight_blue_800,
  },

  iconBoxBlue: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: Colors.peter_river_50,
    justifyContent: "center",
    alignItems: "center",
  },

  iconBoxGreen: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: Colors.emerald_50,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Actions */
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  btnPrimaryRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    gap: 8,
  },

  btnPrimaryRowText: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E4E2",
    gap: 8,
  },

  secondaryButtonText: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_700,
  },

  disabledButton: {
    backgroundColor: Colors.clouds_200,
  },

  disabledText: {
    color: Colors.concrete,
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.asbestos,
  },

  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.concrete,
  },

  /* OTP Modal */
  modalOverlayDark: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(23,32,42,0.5)",
  },

  otpModal: {
    width: "90%",
    backgroundColor: Colors.whiteColor,
    padding: 24,
    borderRadius: 24,
  },

  otpTitle: {
    fontSize: 20,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: PRIMARY,
    textAlign: "center",
  },

  otpSubtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    textAlign: "center",
    marginBottom: 20,
  },

  otpCell: {
    width: 56,
    height: 56,
    marginHorizontal: 6,
    borderRadius: 14,

    backgroundColor: Colors.clouds_200,
    borderWidth: 1,
    borderColor: PRIMARY,

    justifyContent: "center",
    alignItems: "center",
  },

  otpCellFocused: {
    backgroundColor: Colors.peter_river_50,
    borderColor: Colors.peter_river_600,
    borderWidth: 2,
  },
  otpCellText: {
    fontSize: 22,
    lineHeight: 26,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: "#36454F",
    textAlign: "center",
  },

  modalOverlayDarkOngoing: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "rgba(23,32,42,0.5)",
  },

  ongoingModalCard: {
    width: "100%",
    backgroundColor: Colors.whiteColor,
    padding: 24,
    borderRadius: 24,
  },

  floatingButton: {
    position: "absolute",
    bottom: 96,
    right: 20,
  },

  floatingButtonInner: {
    backgroundColor: PRIMARY,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  ongoingModal: {
    backgroundColor: Colors.whiteColor,
    padding: 24,
    borderRadius: 32,
    justifyContent: "flex-end",
  },

  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: Colors.clouds_400,
    alignSelf: "center",
    marginBottom: 20,
  },

  rideTimeCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.peter_river_200,
    backgroundColor: Colors.peter_river_50,
    alignItems: "center",
    marginBottom: 20,
  },

  rideTimeLabel: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.peter_river_700,
  },

  rideTimeValue: {
    fontSize: 48,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  activeBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.emerald_50,
    borderRadius: 999,
  },

  activeBadgeText: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.emerald_700,
  },

  locationCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.clouds_500,
    backgroundColor: Colors.clouds_300,
    marginBottom: 12,
  },

  locationLabel: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    textTransform: "uppercase",
  },

  locationValue: {
    marginTop: 4,
    fontSize: 17,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
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
    borderColor: Colors.clouds_500,
    backgroundColor: Colors.clouds_300,
  },

  infoLabel: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    textTransform: "uppercase",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 18,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  cancelSoftButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.clouds_300,
    alignItems: "center",
    marginTop: 8,
    borderColor: "#E5E4E2",
    borderWidth: 1,
    marginBottom: 55,
  },

  cancelSoftText: {
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: "#899499",
  },

  btnPrimarySolid: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    marginTop: 40,
  },

  btnPrimarySolidText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  btnSuccessSolid: {
    backgroundColor: Colors.emerald_600,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  btnSuccessSolidText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  primaryButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },
});
