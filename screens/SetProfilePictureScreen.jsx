import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, ScrollView, StatusBar, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../lib/style";
import * as ImageManipulator from "expo-image-manipulator";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "../firebase";
import { initializeApp, getApps } from "firebase/app";
import { LinearGradient } from "expo-linear-gradient";

const PRIMARY = "#0193e0";

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export default function SetProfilePictureScreen() {
  const { ownUser, authPostFetch } = useAuth();
  const navigation = useNavigation();

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Toast.show({
          type: "error",
          text1: "Gallery permission required",
          text2: "Please allow gallery access to upload a photo.",
          text2Style: { fontSize: 12 },
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        selectionLimit: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];

      if (asset.height + 20 < asset.width) {
        Toast.show({
          type: "error",
          text1: "Landscape Image Not Allowed",
          text2: "Please select a portrait-oriented image.",
        });
        return;
      }
      if (asset.width < 500) {
        Toast.show({
          type: "error",
          text1: "Image Too Small",
          text2: "Please select an image with a minimum width of 500 pixels.",
        });
        return;
      }
      setImage(result.assets[0]);
    } catch (error) {
      console.error("Image-picker error:", error);
      Toast.show({
        type: "error",
        text1: "Something Went Wrong",
        text2: "An unexpected error occurred while selecting the image.",
      });
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Camera Permission Required", "Please grant camera access to take a photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        aspect: [3, 4],
        quality: 1,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      if (asset.height < asset.width) {
        Toast.show({
          type: "error",
          text1: "Landscape Image Not Allowed",
          text2: "Please take a portrait-oriented photo.",
        });
        return;
      }

      if (asset.width < 500) {
        Toast.show({
          type: "error",
          text1: "Image Too Small",
          text2: "Please use a photo that is at least 500 pixels wide.",
        });
        return;
      }
      setImage(result.assets[0]);
    } catch (error) {
      console.error("Camera error:", error);
      Toast.show({
        type: "error",
        text1: "Something Went Wrong",
        text2: "An error occurred while accessing the camera.",
      });
    }
  };

  const createThumbnail = async (sourceImage) => {
    let manipResult = await ImageManipulator.manipulateAsync(sourceImage, [{ resize: { width: 800 } }], { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG });
    let sqrImg = await ImageManipulator.manipulateAsync(manipResult.uri, [{ crop: { height: 800, originX: 0, originY: 0, width: 800 } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
    // let thumbnail = await ImageManipulator.manipulateAsync(sqrImg.uri, [{ resize: { width: 200 } }], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
    return { fullImage: manipResult.uri, sqrImage: sqrImg.uri };
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

  const uploadImageAsync = async () => {
    try {
      setUploading(true);
      const uri = image.uri;
      const { fullImage, sqrImage } = await createThumbnail(uri);

      const [fullBlob, sqrBlob] = await Promise.all([uriToBlob(fullImage), uriToBlob(sqrImage)]);
      const storage = getStorage();
      const basePath = `mrDriverPartnerProfile/${ownUser._id}-${ownUser.mobileNumber}`;

      const fullFileRef = ref(storage, `${basePath}/port_${Date.now()}.jpg`);
      const sqrFileRef = ref(storage, `${basePath}/sqr_${Date.now()}.jpg`);
      await Promise.all([uploadBytes(fullFileRef, fullBlob), uploadBytes(sqrFileRef, sqrBlob)]);
      fullBlob.close?.();
      sqrBlob.close?.();
      const [fullUrl, sqrUrl] = await Promise.all([getDownloadURL(fullFileRef), getDownloadURL(sqrFileRef)]);

      const bodyTxt = {
        regiStatus: "drivlic",
        profilePictureFull: fullUrl,
        profilePictureSquare: sqrUrl,
      };

      const res = await authPostFetch("driver/update", bodyTxt, true);
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Profile Pic Updated Successfully",
          text2: "Profile Pic Updated Successfully",
        });
        navigation.navigate("add-driving-license");
      } else {
        Toast.show({
          type: "error",
          text1: "Something Went Wrong",
          text2: "An error occurred while Uploading Image",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Something Went Wrong",
        text2: error?.message ?? "Upload failed",
      });
      console.error("Image upload failed:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile Photo</Text>
          <Text style={styles.subtitle}>This helps riders recognize you easily</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>{image ? <Image source={{ uri: image.uri }} style={styles.avatarImage} /> : <Ionicons name="person-circle-outline" size={80} color="#9CA3AF" />}</View>

          <View style={styles.actionRow}>
            <ActionButton icon="camera-outline" label="Camera" onPress={openCamera} />
            <ActionButton icon="image-outline" label="Gallery" onPress={pickImage} />
          </View>

          {image && (
            <TouchableOpacity onPress={() => setImage(null)}>
              <Text style={styles.removeText}>Remove photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.guidelines}>
          <Text style={styles.guidelineTitle}>Photo Guidelines</Text>

          <View style={styles.guidelineCard}>
            {["Use a clear, front-facing selfie", "Only you should be visible in the photo", "Accepted formats: JPG or PNG"].map((text, index) => (
              <View key={index} style={styles.guidelineRow}>
                <Ionicons name="checkmark-circle" size={18} color={PRIMARY} />
                <Text style={styles.guidelineText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>
        {uploading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} disabled={uploading || !image} onPress={() => uploadImageAsync()} style={[styles.submitButton, uploading && styles.submitButtonDisabled]}>
          <Text style={styles.submitButtonText}>{uploading ? "Saving..." : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.actionButton}>
      <Ionicons name={icon} size={18} color={PRIMARY} />
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
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

  /* Avatar */
  avatarSection: {
    alignItems: "center",
    marginTop: 36,
  },

  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.clouds_600,
    backgroundColor: Colors.clouds_100,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },

  /* Actions */
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
    borderRadius: 14,
    backgroundColor: Colors.whiteColor,
  },

  actionText: {
    fontSize: 14,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  removeText: {
    marginTop: 14,
    fontSize: 14,
    color: Colors.alizarin_600,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
  },

  /* Guidelines */
  guidelines: {
    paddingHorizontal: 24,
    marginTop: 32,
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

  submitButtonText: {
    fontSize: 16,
    color: Colors.whiteColor,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
