import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "../context/useAuth";
import { Colors, Fonts } from "../lib/style";

const ONLINE = "#16A34A";
const ONLINE_BG = "#DCFCE7";
const ONLINE_BORDER = "#86EFAC";

const OFFLINE = "#DC2626";
const OFFLINE_BG = "#FEE2E2";
const OFFLINE_BORDER = "#FCA5A5";

export default function Navbar() {
  const { isOnline, updateDriverStatus, authPostFetch, ownUser } = useAuth();

  const switchStatus = async () => {
    try {
      const status = isOnline === "Offline" ? "Online" : "Offline";

      const res = await authPostFetch("driver/updateDriverStaus", { currentStatus: status }, true);

      if (res?.success) {
        updateDriverStatus(status);
      } else {
        Toast.show({
          type: "error",
          text1: "Unable to update status",
          text2: res?.message || "Something went wrong",
          text2Style: {
            fontSize: 12,
            fontWeight: "400",
          },
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Check your internet connection",
        text2Style: {
          fontSize: 12,
          fontWeight: "400",
        },
      });
    }
  };

  const isDriverOnline = isOnline === "Online";

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Image source={ownUser?.profilePictureSquare ? { uri: ownUser.profilePictureSquare } : require("../assets/logos/mr-driver-partner-logo.png")} resizeMode="contain" style={styles.logo} />
        <Text style={styles.infoLabel}>{ownUser?.fullName}</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={switchStatus} style={[styles.statusButton, isDriverOnline ? styles.onlineButton : styles.offlineButton]}>
          <Text style={[styles.statusText, isDriverOnline ? styles.onlineText : styles.offlineText]}>{isOnline}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 17,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    fontWeight: 500,
    textTransform: "uppercase",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius : 30
  },

  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 14,
    fontFamily: "interSemiBold",
  },

  onlineButton: {
    backgroundColor: ONLINE_BG,
    borderColor: ONLINE_BORDER,
  },
  onlineText: {
    color: ONLINE,
  },

  offlineButton: {
    backgroundColor: OFFLINE_BG,
    borderColor: OFFLINE_BORDER,
  },
  offlineText: {
    color: OFFLINE,
  },
});
