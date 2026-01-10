import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "expo-checkbox";
import React, { useState } from "react";
import { StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Colors, Fonts } from "../lib/style";
import { useRide } from "../context/useRide";

const PRIMARY = "#0193e0";

export default function CompleteProfileScreen() {
  const { authPostFetch } = useAuth();
  const { appInfo } = useRide();

  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [skill, setSkill] = useState("");
  const [exp, setExp] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [carModel, setCarModel] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const carModels = appInfo?.appData[0]?.carModels || [];
  const showError = (title, message) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      text1Style: { fontSize: 13 },
      text2Style: { fontSize: 12 },
    });
  };

  const handleContinue = async () => {
    if (isSubmitting) return;

    if (!age || !exp || !gender || !city || !skill) {
      return showError("Incomplete profile", "Please fill all required fields.");
    }

    const ageNum = Number(age);
    const expNum = Number(exp);

    if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
      return showError("Invalid age", "Age must be between 18 and 70.");
    }

    if (isNaN(expNum) || expNum < 0 || expNum > ageNum - 18) {
      return showError("Invalid experience", "Experience does not match your age.");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showError("Invalid email", "Please enter a valid email address.");
    }

    if (!accepted) {
      return showError("Terms not accepted", "Please accept the Terms & Conditions to continue.");
    }

    setIsSubmitting(true);

    try {
      const res = await authPostFetch("driver/update", {
        regiStatus: "setprof",
        gender,
        city,
        age: ageNum,
        experience: expNum,
        carModel,
        skill,
        email,
      }, true);

      if (!res?.success) {
        return showError("Update failed", res?.message || "Please try again.");
      }

      navigation.navigate("set-profile-pic");
    } catch (err) {
      showError("Something went wrong", err.message || "Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <View>
            <Text style={styles.headerTitle}>Complete Your Profile</Text>
            <Text style={styles.headerSubtitle}>Help us assign you the right trips and experience.</Text>
          </View>
          <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" maxLength={2} placeholder="Enter your age" />

          <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@example.com" />

          <Field label="Driving Experience (Years)" value={exp} onChangeText={setExp} keyboardType="number-pad" maxLength={2} placeholder="e.g. 3" />

          <Field label="City" value={city} onChangeText={setCity} placeholder="Your city" />

          <PickerField
            label="Gender"
            selectedValue={gender}
            onValueChange={setGender}
            items={[
              { label: "Select gender", value: "", color: "#9CA3AF" },
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />

          <PickerField
            label="Car Model"
            selectedValue={carModel}
            onValueChange={setCarModel}
            items={[
              { label: "Select car model", value: "", color: "#9CA3AF" },
              ...carModels.map((model) => ({
                label: model,
                value: model,
              })),
            ]}
          />

          <PickerField
            label="Driving Skill"
            selectedValue={skill}
            onValueChange={setSkill}
            items={[
              { label: "Select Skill", value: "", color: "#9CA3AF" },
              { label: "Manual", value: "Manual" },
              { label: "Automatic", value: "Automatic" },
              {
                label: "Manual & Automatic",
                value: "Manual & Automatic",
              },
            ]}
          />

          <View style={styles.termsRow}>
            <Checkbox value={accepted} onValueChange={setAccepted} color={PRIMARY} style={styles.checkbox} />

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink} onPress={() => navigation.navigate("terms-and-conditions")}>
                Terms & Conditions
              </Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.85} disabled={isSubmitting} onPress={handleContinue} style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}>
          <Text style={styles.submitButtonText}>{isSubmitting ? "Saving..." : "Continue"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} placeholderTextColor="#6B7280" style={styles.input} />
    </View>
  );
}

function PickerField({ label, selectedValue, onValueChange, items }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#111827">
          {items.map((item, i) => (
            <Picker.Item key={i} {...item} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  scrollContent: {
    padding: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },

  /* Header */
  headerTitle: {
    fontSize: 28,
    textAlign: "center",
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  /* Card */
  formCard: {
    backgroundColor: Colors.whiteColor,
    padding: 24,
    borderRadius: 24,
    gap: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
  },

  /* Labels */
  label: {
    marginBottom: 15,
    fontSize: 13,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
  },

  /* Inputs */
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

  /* Picker */
  pickerWrapper: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.clouds_600,
    backgroundColor: Colors.clouds_100,
    justifyContent: "center",
    overflow: "hidden",
  },

  picker: {
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
  },

  /* Terms */
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  checkbox: {
    marginRight: 10,
  },

  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  termsLink: {
    color: PRIMARY,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* Submit */
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
