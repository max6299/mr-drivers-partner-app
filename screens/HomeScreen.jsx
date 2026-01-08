import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ImageBackground, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../lib/style";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground source={require("../assets/images/getstarted.jpg")} resizeMode="cover" style={styles.imageBackground}>
        {/* Dark cinematic overlay */}
        <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.85)"]} style={styles.gradientOverlay} />

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          <Text style={styles.title}>
            A smarter way{"\n"}
            <Text style={styles.highlight}>to drive & earn</Text>
          </Text>

          <Text style={styles.description}>Receive verified trip requests, get assigned by dispatch, and focus on delivering safe, reliable rides — without the chaos.</Text>

          <TouchableOpacity onPress={() => navigation.navigate("sign-up")} activeOpacity={0.9} style={styles.buttonWrapper}>
            <LinearGradient colors={["#0193e0", "#00b4ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text onPress={() => navigation.navigate("sign-in")} style={styles.signInText}>
              Sign in
            </Text>
          </Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const PRIMARY = "#0193e0";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  imageBackground: {
    flex: 1,
  },

  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    textAlign: "center",
    color: Colors.midnight_blue_900,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  highlight: {
    color: PRIMARY,
  },
  description: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "400",
    paddingHorizontal: 6,
  },
  buttonWrapper: {
    marginTop: 28,
    borderRadius: 16,
    overflow: "hidden",
  },

  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
  },

  buttonText: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.whiteColor,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  footerText: {
    marginTop: 22,
    textAlign: "center",
    color: Colors.asbestos,
    fontFamily: Fonts.GoogleSansFlex,
    fontSize: 14,
    fontWeight: "400",
  },
  signInText: {
    color: PRIMARY,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },
});
