import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useRide } from "../context/useRide";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

const DragableMap = ({ destination, cameraRef }) => {
  const { coords, currentLocation, updateCurrentLocation, isLoading, updateLoading, permissionAsked, updatePermissionAsked } = useRide();

  const requestPermission = async () => {
    if (isLoading) return;

    updateLoading(true);

    try {
      const existing = await Location.getForegroundPermissionsAsync();

      if (existing.status === "granted") {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        updateCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        return;
      }

      const perm = await Location.requestForegroundPermissionsAsync();

      if (perm.status !== "granted") {
        updatePermissionAsked(true);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      updateCurrentLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
    } catch (err) {
      console.warn("Location error:", err);
    } finally {
      updateLoading(false);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(2, { duration: 2000, easing: Easing.out(Easing.ease) }), -1, true);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  useEffect(() => {
    if (!currentLocation && !permissionAsked) {
      updatePermissionAsked(true);
      requestPermission();
    }
  }, [currentLocation, permissionAsked]);

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0193e0" />
            <Text style={styles.loadingText}>Checking location…</Text>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.title}>Location access is disabled</Text>

            <TouchableOpacity style={styles.outlineButton} onPress={requestPermission}>
              <FontAwesome name="location-arrow" size={20} color="#0193e0" />
              <Text style={styles.outlineButtonText}>Enable Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={openSettings}>
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <Mapbox.MapView styleURL={Mapbox.StyleURL.Light} style={styles.map}>
        {currentLocation && <Mapbox.Camera zoomLevel={13} centerCoordinate={[currentLocation.longitude, currentLocation.latitude]} ref={cameraRef} animationMode="flyTo" animationDuration={2000} />}

        {currentLocation && destination ? (
          <>
            <Mapbox.PointAnnotation id="driver-location-marker" coordinate={[currentLocation.longitude, currentLocation.latitude]}>
              <View style={styles.markerStyle}>
                <Ionicons name="car-outline" size={22} color="#fff" />
              </View>
            </Mapbox.PointAnnotation>

            <Mapbox.PointAnnotation id="destination-marker" coordinate={[destination.longitude, destination.latitude]}>
              <View style={styles.markerStyle}>
                <Ionicons name="location-outline" size={22} color="#fff" />
              </View>
            </Mapbox.PointAnnotation>

            {coords?.length >= 2 && (
              <Mapbox.ShapeSource
                id="route-source-line"
                shape={{
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      geometry: {
                        type: "LineString",
                        coordinates: coords,
                      },
                    },
                  ],
                }}
              >
                <Mapbox.LineLayer
                  id="route-line-layer"
                  style={{
                    lineColor: "#0193e0",
                    lineWidth: 5,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </Mapbox.ShapeSource>
            )}
          </>
        ) : (
          <Mapbox.PointAnnotation id="idle-driver-marker" coordinate={[currentLocation?.longitude, currentLocation?.latitude]}>
            <View style={styles.idleMarkerWrapper}>
              <Animated.View style={[styles.outerPulseRing, ringStyle]} />

              <Animated.View style={[styles.innerPulseRing, ringStyle]} />

              <View style={styles.markerStyle}>
                <Ionicons name="car-outline" size={22} color="#fff" />
              </View>
            </View>
          </Mapbox.PointAnnotation>
        )}
      </Mapbox.MapView>
    </View>
  );
};

export default DragableMap;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
  },

  idleMarkerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  outerPulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(1,147,224,0.6)",
  },

  innerPulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(1,147,224,0.4)",
  },

  map: {
    flex: 1,
  },

  markerStyle: {
    backgroundColor: "#0193e0",
    borderColor: "#fff",
    borderWidth: 2,
    borderRadius: 25,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#374151",
    fontFamily: "interRegular",
  },

  content: {
    gap: 12,
    alignItems: "center",
  },

  title: {
    marginBottom: 16,
    fontSize: 18,
    color: "#374151",
    fontFamily: "interRegular",
    textAlign: "center",
  },

  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#0193e0",
    borderRadius: 12,
  },

  outlineButtonText: {
    fontSize: 16,
    color: "#0193e0",
    fontFamily: "interRegular",
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0193e0",
  },

  primaryButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
