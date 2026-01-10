import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../lib/style";
import * as ImageManipulator from "expo-image-manipulator";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "../firebase";
import { initializeApp, getApps } from "firebase/app";

const PRIMARY = "#0193e0";

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function DrivingLicenseScreen() {
  const { ownUser, authPostFetch } = useAuth();
  const navigation = useNavigation();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [drivingLicenseNo, setDrivingLicenseNo] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickImage = async (side) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Please allow gallery access.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 2],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      side === "front" ? setFrontImage(result.assets[0]) : setBackImage(result.assets[0]);
    }
  };

  const captureImage = async (side) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      aspect: [3, 2],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      side === "front" ? setFrontImage(result.assets[0]) : setBackImage(result.assets[0]);
    }
    const asset = result.assets[0];

    if (asset.width < 1000) {
      Toast.show({
        type: "error",
        text1: "Image too small",
        text2: "Please upload a clearer photo of the license.",
      });
      return;
    }
  };

  const createThumbnail = async (uri) => {
    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1200 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
    return result.uri;
  };

  const uriToBlob = async (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = (e) => {
        console.error("Blob fetch error:", e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  };

  const uploadToFirebase = async (image, label) => {
    const compressedUri = await createThumbnail(image.uri);
    const blob = await uriToBlob(compressedUri);

    const storage = getStorage();
    const path = `mrDriverPartnerLicenses/${ownUser._id}/${label}_${Date.now()}.jpg`;
    const fileRef = ref(storage, path);

    await uploadBytes(fileRef, blob);
    blob.close?.();

    return await getDownloadURL(fileRef);
  };

  const handleDrivingLicense = async () => {
    if (uploading) return;

    if (!drivingLicenseNo || !frontImage || !backImage) {
      Toast.show({
        type: "error",
        text1: "Incomplete details",
        text2: "Please upload both sides and enter license number.",
        text2Style: { fontSize: 12 },
      });
      return;
    }

    try {
      setUploading(true);
      const [frontUrl, backUrl] = await Promise.all([uploadToFirebase(frontImage, "front"), uploadToFirebase(backImage, "back")]);

      const bodyTxt = {
        regiStatus: "submited",
        drivingLicence: {
          drivingLicenseNo : drivingLicenseNo.toUpperCase(),
          frontImage: frontUrl,
          backImage: backUrl,
        },
      };
      const res = await authPostFetch("driver/update", bodyTxt, true);

      if (!res?.success) {
        Toast.show({
          type: "error",
          text1: "Upload failed",
          text2: res?.message || "Please try again.",
          text2Style: { fontSize: 12 },
        });
        return;
      }

      navigation.navigate("submit-application");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Upload failed",
        text2: err?.response?.data?.message || "Something went wrong.",
        text2Style: { fontSize: 12 },
      });
    } finally {
      setUploading(false);
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
                  <Image source={{ uri: image.uri }} style={styles.uploadedImage} />

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
        {uploading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} disabled={uploading} onPress={handleDrivingLicense} style={[styles.submitButton, uploading && styles.submitButtonDisabled]}>
          <Text style={styles.submitText}>{uploading ? "Submitting..." : "Submit"}</Text>
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
