import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import appStyle from "../lib/style";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import storage from "@react-native-firebase/storage";
import Toast from "react-native-toast-message";
import { Checkbox } from "expo-checkbox";
import { useRide } from "../context/useRide";
const { Colors, Fonts } = appStyle;

export default function EditProfileScreen({ navigation }) {
  const { ownUser, authPostFetch } = useAuth();
  const { appInfo } = useRide();
  const insets = useSafeAreaInsets();

  const carModels = appInfo?.appData[0]?.carModels || [];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [skill, setSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [carType, setCarType] = useState([]);

  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (ownUser) {
      setFullName(ownUser.fullName || "");
      setEmail(ownUser.email || "");
      setGender(ownUser.gender || "");
      setCity(ownUser.city || "");
      setAge(ownUser.age ? String(ownUser.age) : "");
      setSkill(ownUser.skill || "");
      setExperience(ownUser.experience ? String(ownUser.experience) : "");
      setCarType(ownUser.carType || []);
      setProfilePic(ownUser.profilePictureFull || null);
    }
  }, [ownUser]);

  const pickFromGallery = async () => {
    setShowPickerModal(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Gallery access is needed to choose a profile photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    setShowPickerModal(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take a profile photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const pickImage = () => {
    setShowPickerModal(true);
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

  const uploadImageToFirebase = async (uri) => {
    const filename = `profile_${ownUser._id}_${Date.now()}.jpg`;
    const storageRef = storage().ref(`mrDriverPartnerProfile/${filename}`);
    const blob = await uriToBlob(uri);
    await storageRef.put(blob);
    blob.close?.();
    return await storageRef.getDownloadURL();
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full name is required.");
      return false;
    }
    if (age) {
      const ageNum = Number(age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
        Alert.alert("Error", "Age must be between 18 and 70.");
        return false;
      }
    }
    if (experience) {
      const expNum = Number(experience);
      if (isNaN(expNum) || expNum < 0) {
        Alert.alert("Error", "Please enter a valid experience value.");
        return false;
      }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      let profilePictureFull = ownUser?.profilePictureFull || "";
      let profilePictureSquare = ownUser?.profilePictureSquare || "";

      if (profilePic && profilePic !== ownUser?.profilePictureFull) {
        setUploading(true);
        const url = await uploadImageToFirebase(profilePic);
        profilePictureFull = url;
        profilePictureSquare = url;
        setUploading(false);
      }

      const bodyTxt = {
        fullName,
        email,
        gender,
        city,
        age: age ? Number(age) : undefined,
        skill,
        experience: experience ? Number(experience) : undefined,
        carType,
        profilePictureFull,
        profilePictureSquare,
      };

      const res = await authPostFetch("driver/update", bodyTxt, true);
      if (res?.success) {
        setShowSuccessModal(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Update Failed",
          text2: res?.message || "Something went wrong",
        });
      }
    } catch (err) {
      setUploading(false);
      Toast.show({
        type: "error",
        text1: "Something Went Wrong",
        text2: err?.message || "Update failed",
      });
    }
  };

  if (!ownUser) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user details available.</Text>
      </SafeAreaView>
    );
  }

  const toggleCarType = (value) => {
    if (carType.includes(value)) {
      setCarType(carType.filter((v) => v !== value));
    } else {
      setCarType([...carType, value]);
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

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarRing}>
              <Image
                source={{
                  uri: profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatarImage}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
            <MaterialIcons name="edit" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={18} color={Colors.peter_river_600} />
              <Text style={styles.labelText}>Full Name</Text>
            </View>

            <TextInput value={fullName} onChangeText={setFullName} placeholder="Enter your full name" placeholderTextColor={Colors.concrete} style={styles.input} />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="mail-outline" size={18} color={Colors.peter_river_600} />
              <Text style={styles.labelText}>Email</Text>
            </View>

            <TextInput value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor={Colors.concrete} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.rowGroup}>
            <View style={styles.halfField}>
              <View style={styles.labelRow}>
                <Ionicons name="location-outline" size={18} color={Colors.peter_river_600} />
                <Text style={styles.labelText}>City</Text>
              </View>

              <TextInput value={city} onChangeText={setCity} placeholder="Enter your city" placeholderTextColor={Colors.concrete} style={styles.input} />
            </View>

            <View style={styles.halfField}>
              <View style={styles.labelRow}>
                <Ionicons name="people-outline" size={18} color={Colors.peter_river_600} />
                <Text style={styles.labelText}>Gender</Text>
              </View>

              <View style={styles.pickerWrapper}>
                <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker} dropdownIconColor={Colors.midnight_blue_900}>
                  <Picker.Item label="Select" value="" color={Colors.concrete} />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="car-outline" size={18} color={Colors.peter_river_600} />
              <Text style={styles.labelText}>Driving Skill</Text>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker selectedValue={skill} onValueChange={setSkill} style={styles.picker} dropdownIconColor={Colors.midnight_blue_900}>
                <Picker.Item label="Select skill" value="" color={Colors.concrete} />
                <Picker.Item label="Manual" value="Manual" />
                <Picker.Item label="Automatic" value="Automatic" />
                <Picker.Item label="Manual & Automatic" value="Manual & Automatic" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="grid-outline" size={18} color={Colors.peter_river_600} />
              <Text style={styles.labelText}>Car Types</Text>
            </View>

            {carModels.length > 0 ? (
              carModels.map((model, index) => (
                <TouchableOpacity key={index} style={styles.multiSelectRow} onPress={() => toggleCarType(model)} activeOpacity={0.7}>
                  <Checkbox value={carType.includes(model)} onValueChange={() => toggleCarType(model)} color={PRIMARY} />
                  <Text style={styles.multiSelectText}>{model}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TextInput
                value={carType.join(", ")}
                onChangeText={(text) => setCarType(text.split(",").map((s) => s.trim()).filter(Boolean))}
                placeholder="e.g. Sedan, SUV"
                placeholderTextColor={Colors.concrete}
                style={styles.input}
              />
            )}
          </View>

          <TouchableOpacity onPress={handleSave} disabled={uploading} style={[styles.saveButton, uploading && styles.saveButtonDisabled]}>
            {uploading ? (
              <ActivityIndicator color={Colors.whiteColor} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal visible={showSuccessModal} transparent animationType="slide" statusBarTranslucent>
        <View style={[styles.successOverlay, { paddingBottom: insets.bottom }]}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
            <Text style={styles.successTitle}>Profile Updated</Text>
            <Text style={styles.successText}>Your profile details have been saved successfully.</Text>

            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showPickerModal} animationType="slide" statusBarTranslucent>
        <Pressable style={styles.overlay} onPress={() => setShowPickerModal(false)} />
        <View style={[styles.actionSheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.actionTitle}>Profile Photo</Text>

          <TouchableOpacity style={styles.actionRow} onPress={pickFromCamera}>
            <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="camera" size={22} color="#2E7D32" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Camera</Text>
              <Text style={styles.actionDesc}>Take a photo</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity style={styles.actionRow} onPress={pickFromGallery}>
            <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="images" size={22} color="#E65100" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Gallery</Text>
              <Text style={styles.actionDesc}>Choose from library</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCancel} onPress={() => setShowPickerModal(false)}>
            <Text style={styles.actionCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.clouds_300,
  },

  inputGroup: {
    marginBottom: 16,
  },

  rowGroup: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  halfField: {
    flex: 1,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },

  labelText: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.asbestos,
  },

  input: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_400,
    borderRadius: 14,
    backgroundColor: Colors.whiteColor,
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.midnight_blue_900,
  },

  pickerWrapper: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_400,
    backgroundColor: Colors.whiteColor,
    justifyContent: "center",
    overflow: "hidden",
  },

  picker: {
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
  },

  multiSelectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  multiSelectText: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
  },

  /* Avatar */
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatarOuter: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: Colors.peter_river_50,
  },

  avatarRing: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },

  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.whiteColor,
  },

  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: "34%",
    backgroundColor: PRIMARY,
    padding: 7,
    borderRadius: 999,
  },

  /* Buttons */
  saveButton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.whiteColor,
  },

  /* Success Modal */
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(11,31,51,0.45)",
    justifyContent: "flex-end",
  },

  successBox: {
    backgroundColor: Colors.whiteColor,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    alignItems: "center",
  },

  successTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.midnight_blue_900,
  },

  successText: {
    fontSize: 14,
    color: Colors.asbestos,
    textAlign: "center",
    marginTop: 8,
    fontFamily: Fonts.GoogleSansFlex,
  },

  successBtn: {
    marginTop: 28,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 16,
  },

  successBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
  },

  /* Action Sheet */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,31,51,0.45)",
  },

  actionSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
  },

  handle: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },

  actionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    marginBottom: 16,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  actionContent: {
    flex: 1,
  },

  actionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
  },

  actionDesc: {
    fontSize: 13,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    marginTop: 1,
  },

  actionDivider: {
    height: 1,
    backgroundColor: Colors.clouds_400,
    marginLeft: 58,
  },

  actionCancel: {
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },

  actionCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
  },
});
