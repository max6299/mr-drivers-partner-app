import React, { useEffect, useState } from "react";
import { StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Colors, Fonts } from "../lib/style";

const CELL_COUNT = 4;
const PRIMARY = "#0193e0";

export default function VerifForgotPasswordOTP() {
  const { ownUser, authPostFetch } = useAuth();

  const navigation = useNavigation();
  const OTP_DURATION = 120;
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const route = useRoute();

  const { mobileNumber } = route.params || {};

  const ref = useBlurOnFulfill({ value: otp, cellCount: CELL_COUNT });

  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const handleVerify = async () => {
    if (isVerifying) return;

    if (otp.length !== CELL_COUNT) {
      return Toast.show({
        type: "error",
        text1: "Invalid code",
        text2: "Please enter the complete 4-digit OTP.",
        text2Style: { fontSize: 12 },
      });
    }

    setIsVerifying(true);

    const bodyTxt = {
      mobileNumber: mobileNumber,
      otp,
    };
    try {
      const res = await authPostFetch("driver/verifyResetPassword", bodyTxt);
      if (!res?.success) {
        return Toast.show({
          type: "error",
          text1: "Verification failed",
          text2: "Your mobile number has been verified.",
          text2Style: { fontSize: 12 },
        });
      }

      Toast.show({
        type: "success",
        text1: "Verified successfully",
        text2: "Your mobile number has been verified.",
        text2Style: { fontSize: 12 },
      });

      navigation.navigate("update-password", { mobileNumber: mobileNumber });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Verification failed",
        text2: "Your mobile number has been verified.",
        text2Style: { fontSize: 12 },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await authPostFetch("driver/sendResetPasswordOTP", { mobileNumber: mobileNumber });
      if (!res?.success) {
        return Toast.show({ type: "error", text1: "Verification failed" });
      }
      Toast.show({
        type: "info",
        text1: "OTP resent",
        text2: "Please check your mobile for the new code.",
        text2Style: { fontSize: 12 },
      });
    } catch (err) {
      showError("Verification failed", err?.message || "Something went wrong.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>

          <Text style={styles.subtitle}>Enter the 4-digit code sent to</Text>

          <Text style={styles.mobile}>{ownUser?.mobileNumber}</Text>
        </View>

        <View style={styles.codeFieldWrapper}>
          <CodeField
            ref={ref}
            {...props}
            value={otp}
            onChangeText={setOtp}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            rootStyle={styles.codeFieldRoot}
            renderCell={({ index, symbol, isFocused }) => (
              <View key={index} onLayout={getCellOnLayoutHandler(index)} style={[styles.cell, isFocused ? styles.cellFocused : styles.cellDefault]}>
                <Text style={styles.cellText}>{symbol || (isFocused ? <Cursor /> : null)}</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.resendRow}>
          <>
            <Text style={styles.resendText}>Didn’t receive the code?</Text>
            <TouchableOpacity onPress={() => handleResend()} disabled={isResending}>
              <Text style={styles.resendAction}>{isResending ? "Resending" : "Resend"}</Text>
            </TouchableOpacity>
          </>
        </View>

        <TouchableOpacity activeOpacity={0.85} disabled={isVerifying} onPress={handleVerify} style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}>
          <Text style={styles.verifyButtonText}>{isVerifying ? "Verifying..." : "Verify"}</Text>
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

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 36,
  },

  title: {
    fontSize: 32,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  mobile: {
    marginTop: 6,
    fontSize: 15,
    color: Colors.peter_river_600,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  /* OTP */
  codeFieldWrapper: {
    alignItems: "center",
    marginBottom: 28,
  },

  codeFieldRoot: {
    justifyContent: "center",
    gap: 10,
  },

  cell: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: Colors.clouds_100,
  },

  cellDefault: {
    borderColor: Colors.clouds_600,
  },

  cellFocused: {
    borderColor: Colors.peter_river_600,
    backgroundColor: Colors.peter_river_50,
  },

  cellText: {
    fontSize: 22,
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },

  /* Resend */
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 28,
  },

  resendText: {
    fontSize: 14,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },

  resendAction: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.peter_river_600,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  /* Button */
  verifyButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },

  verifyButtonDisabled: {
    opacity: 0.7,
  },

  verifyButtonText: {
    fontSize: 16,
    color: Colors.whiteColor,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  timerText: {
    fontSize: 14,
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
  },
});
