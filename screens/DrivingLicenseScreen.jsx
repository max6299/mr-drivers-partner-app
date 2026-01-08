import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../lib/style";

const PRIMARY = "#0193e0";

export default function DrivingLicenseScreen() {
  const { ownUser, setOwnUser, authPostFetch } = useAuth();
  const navigation = useNavigation();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [drivingLicenseNo, setDrivingLicenseNo] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async (side) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Please allow gallery access to upload documents.",
        text2Style: { fontSize: 12 },
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      side === "front" ? setFrontImage(uri) : setBackImage(uri);
    }
  };

  const captureImage = async (side) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Camera permission required",
        text2: "Please allow camera access to capture your license.",
        text2Style: { fontSize: 12 },
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      side === "front" ? setFrontImage(uri) : setBackImage(uri);
    }
  };

  const handleDrivingLicense = async () => {
    if (loading) return;

    if (!drivingLicenseNo || !frontImage || !backImage) {
      Toast.show({
        type: "error",
        text1: "Incomplete details",
        text2: "Please upload both sides and enter license number.",
        text2Style: { fontSize: 12 },
      });
      return;
    }

    setLoading(true);

    try {
      const res = await authPostFetch("driver/update", {
        regiStatus: "submited",
        drivingLicence: {
          drivingLicenseNo,
          frontImage,
          backImage,
        },
      });

      if (!res?.success) {
        Toast.show({
          type: "error",
          text1: "Upload failed",
          text2: res?.message || "Please try again.",
          text2Style: { fontSize: 12 },
        });
        return;
      }

      setOwnUser(res.data);
      navigation.navigate("submit-application");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: err?.response?.data?.message || "Something went wrong.",
        text2Style: { fontSize: 12 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Driving License</Text>
          <Text style={styles.subtitle}>Upload clear images of your driving license</Text>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput placeholder="Driving License Number" placeholderTextColor="#6B7280" value={drivingLicenseNo} onChangeText={setDrivingLicenseNo} style={styles.input} />
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelineTitle}>Upload Guidelines</Text>

          <View style={styles.guidelineCard}>
            {["Original license only (no photocopies)", "All details must be clearly visible", "Supported formats: JPG, PNG (max 10MB)"].map((text, index) => (
              <View key={index} style={styles.guidelineRow}>
                <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
                <Text style={styles.guidelineText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.uploadRow}>
          {[
            {
              label: "Front Side",
              side: "front",
              image: frontImage,
            },
            {
              label: "Back Side",
              side: "back",
              image: backImage,
            },
          ].map(({ label, side, image }) => (
            <View key={side} style={styles.uploadBox}>
              {image ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.uploadedImage} />

                  <TouchableOpacity style={styles.removeButton} onPress={() => (side === "front" ? setFrontImage(null) : setBackImage(null))}>
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={28} color="#9CA3AF" />
                  <Text style={styles.uploadLabel}>{label}</Text>

                  <View style={styles.uploadActions}>
                    <TouchableOpacity onPress={() => captureImage(side)} style={styles.iconButton}>
                      <Ionicons name="camera-outline" size={16} color={PRIMARY} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => pickImage(side)} style={styles.iconButton}>
                      <Ionicons name="image-outline" size={16} color={PRIMARY} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} disabled={loading} onPress={handleDrivingLicense} style={[styles.submitButton, loading && styles.submitButtonDisabled]}>
          <Text style={styles.submitText}>{loading ? "Submitting..." : "Submit"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteColor,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* Header */
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 36,
  },

  title: {
    fontSize: 28,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  /* Input */
  inputWrapper: {
    paddingHorizontal: 24,
    marginTop: 28,
  },

  input: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
    backgroundColor: Colors.clouds_100,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontSize: 15,
    fontWeight: "500",
  },

  /* Guidelines */
  guidelines: {
    paddingHorizontal: 24,
    marginTop: 24,
  },

  guidelineTitle: {
    marginBottom: 10,
    fontSize: 14,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  guidelineCard: {
    backgroundColor: Colors.clouds_100,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
  },

  guidelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  guidelineText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  /* Upload */
  uploadRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 28,
  },

  uploadBox: {
    flex: 1,
    height: 176,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.clouds_600,
    borderRadius: 16,
    backgroundColor: Colors.clouds_100,
    overflow: "hidden",
  },

  imageWrapper: {
    width: "100%",
    height: "100%",
  },

  uploadedImage: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.whiteColor,
    borderRadius: 20,
  },

  uploadPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  uploadLabel: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
  },

  uploadActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },

  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
    borderRadius: 12,
    backgroundColor: Colors.whiteColor,
  },

  /* Footer */
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.clouds_600,
    backgroundColor: Colors.whiteColor,
  },

  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitText: {
    fontSize: 16,
    color: Colors.whiteColor,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
