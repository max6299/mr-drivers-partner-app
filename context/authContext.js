import { createContext, useEffect, useState } from "react";
import * as Device from "expo-device";
import { AppState, Platform, PermissionsAndroid } from "react-native";
import { displayNotification, registerNotificationClicks } from "../lib/notificationService";
import * as SecureStore from "expo-secure-store";
// Firebase Messaging Imports
import { getMessaging, requestPermission, getToken, onTokenRefresh, onMessage, onNotificationOpenedApp, getInitialNotification, AuthorizationStatus } from "@react-native-firebase/messaging";

import { getApp } from "@react-native-firebase/app";
import Toast from "react-native-toast-message";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [ownUser, setOwnUser] = useState({});
  const [accessToken, setAccessToken] = useState(null);
  const [isInitLoading, setIsInitLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  // Notification States
  const [pushToken, setPushToken] = useState(null);
  const [deviceID, setDeviceID] = useState(null);
  const [pendingNotification, setPendingNotification] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null);
  const [isOnline, setIsOnline] = useState("Offline");
  const [rating, setRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const app = getApp();
  const messagingInstance = getMessaging(app);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) return null;
    const authStatus = await requestPermission(messagingInstance);
    const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
    if (!enabled) return null;
    if (Platform.OS === "android" && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
      } catch (err) {
        console.log("Notification permission error", err);
        return null;
      }
    }
    const token = await getToken(messagingInstance);
    setPushToken(token);
    return token;
  };

  const handleNotificationNavigation = (data) => {
    if (!data?.type) return;
    setPendingNotification(data);
  };

  useEffect(() => {
    const unsubscribe = onTokenRefresh(messagingInstance, (token) => {
      setPushToken(token);
    });
    return unsubscribe;
  }, []);

  // Foreground Notification while it running
  useEffect(() => {
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      console.log("FCM Foreground Message:", remoteMessage);
      await displayNotification(remoteMessage);
    });
    return unsubscribe;
  }, []);

  // Background Notification while it running in background
  useEffect(() => {
    const unsubscribe = onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      if (remoteMessage?.data) {
        handleNotificationNavigation(remoteMessage.data);
      }
    });
    return unsubscribe;
  }, []);

  // Background Notification while it's closed, to open app fresh
  useEffect(() => {
    getInitialNotification(messagingInstance).then((remoteMessage) => {
      if (remoteMessage?.data) {
        handleNotificationNavigation(remoteMessage.data);
      }
    });
  }, []);

  // After user taps
  useEffect(() => {
    const unsubscribe = registerNotificationClicks(handleNotificationNavigation);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadTokens = async () => {
      setIsInitLoading(true);
      const aToken = await SecureStore.getItemAsync("AccessToken");
      const rToken = await SecureStore.getItemAsync("RefreshToken");
      if (aToken && rToken) {
        setAccessToken(aToken);
        setRefreshToken(rToken);
      } else {
        setIsInitLoading(false);
        setEventLoading(false);
      }
    };
    loadTokens();
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (!accessToken || !ownUser?._id || !pushToken) return;
    const lastPushToken = ownUser?.pushToken;
    if (lastPushToken !== pushToken) {
      const bodytxt = {
        pushToken
      };
      authPostFetch("driver/newPushToken", bodytxt,true);
    }
  }, [accessToken, ownUser, pushToken]);

  useEffect(() => {
    if (accessToken !== null) {
      getInitData();
    }
  }, [accessToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        registerForPushNotifications();
      }
    });
    return () => subscription.remove();
  }, []);

  const getInitData = async () => {
    setIsInitLoading(true);

    const result = await authPostFetch("driver/getuser");
    if (result.success) {
      setOwnUser(result.data);
      setPushToken(result.data.pushToken)
      setRating(result.averageRating);
      setTotalRatings(result.totalRatings);
      setInitialRoute(getInitialRoute(result.data));
      setEventLoading(false);
      setIsInitLoading(false);
    } else {
      setIsInitLoading(false);
      if (result.trigger === "Logout") {
        mrDriverPartnerLogout();
      }
    }
  };

  const getInitialRoute = (driver) => {
    if (!driver) return "home";
    if (driver.isVerified) return null;

    switch (driver.regiStatus) {
      case "verif":
        return "verify-otp";
      case "comprof":
        return "complete-profile";
      case "setprof":
        return "set-profile-pic";
      case "drivlic":
        return "add-driving-license";
      case "submited":
        return "submit-application";
      default:
        return "home";
    }
  };

  const updateDriverStatus = (data) => {
    setIsOnline(data);
  };

  const mrDriverPartnerSignin = async ({ mobileNumber, pass }) => {
    setEventLoading(true);
    const bodytxt = {
      mobileNumber: mobileNumber,
      password: pass,
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      pushToken: pushToken,
    };

    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}driver/signin`, bodytxt);
      if (res.data.success) {
        await SecureStore.setItemAsync("AccessToken", res.data.accessToken);
        await SecureStore.setItemAsync("RefreshToken", res.data.refreshToken);
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setOwnUser(res.data.userData);
      } else {
        Toast.show({
          type: "error",
          text1: res.data.message,
          text2: res.data.subMess,
        });
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        type: "error",
        text1: "Check Your Internet",
        text2: "Internet may have gone wrong",
      });
    } finally {
      setEventLoading(false);
    }
  };

  const mrDriverPartnerSignup = async ({ fullName, mobileNumber, password, regiStatus }) => {
    setEventLoading(true);
    const bodytxt = {
      fullName,
      mobileNumber,
      password,
      regiStatus,
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      pushToken: pushToken,
    };

    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}driver/signup`, bodytxt);
      if (res.data.success) {
        await SecureStore.setItemAsync("AccessToken", res.data.accessToken);
        await SecureStore.setItemAsync("RefreshToken", res.data.refreshToken);

        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setOwnUser(res.data.userData);
        setPushToken(res.data.userData.pushToken)

        if (res.data.userData.regiStatus === "verif") {
          const res1 = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}driver/sendOTP`, { mobileNumber: res.data.userData.mobileNumber });
          if (!res1.data.success) {
            Toast.show({
              type: "info",
              text1: "Unable to send OTP",
              text2: "Plese try again later",
              text2Style: { fontSize: 12 },
            });
          }
        }
        return res.data;
      } else {
        Toast.show({
          type: "error",
          text1: "Sign up Failed",
          text2: res.data.message,
        });
      }
    } catch (err) {
      console.log(err);

      Toast.show({
        type: "error",
        text1: "Check Your Internet",
        text2: "Internet may have gone wrong",
      });
    } finally {
      setEventLoading(false);
    }
  };

  const mrDriverPartnerLogout = async () => {
    await SecureStore.deleteItemAsync("AccessToken");
    await SecureStore.deleteItemAsync("RefreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setEventLoading(false);
    setIsInitLoading(false);
    setOwnUser({});
    setPushToken(null);
    setDeviceID(null);
  };

  const mrDriverRefreshToken = async () => {
    const config = {
      headers: { Authorization: "Bearer " + refreshToken },
    };
    try {
      const res = await axios.get(`${process.env.EXPO_PUBLIC_BASE_URL}driver/refreshTheToken`, config);
      if (res.data.success) {
        await SecureStore.setItemAsync("AccessToken", res.data.accessToken);
        await SecureStore.setItemAsync("RefreshToken", res.data.refreshToken);
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        return res.data.accessToken;
      } else {
        mrDriverPartnerLogout();
        return null;
      }
    } catch (e) {
      console.log(e);

      // mrDriverPartnerLogout();
      return null;
    }
  };

  const authPostFetch = async (url, options = {}, updateUser = false) => {
    const config = {
      headers: { Authorization: "Bearer " + accessToken },
    };

    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}${url}`, options, config);
      if (res.data.success) {
        if (updateUser && res.data.userData !== undefined) {
          setOwnUser(res.data.userData);
        }
        return res.data;
      } else {
        if (res.data.message == "Token Expired") {
          const newToken = await mrDriverRefreshToken();
          const config1 = {
            headers: { Authorization: "Bearer " + newToken },
          };
          const res1 = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}${url}`, options, config1);
          if (res1.data.success) {
            if (updateUser && res1.data.ownuser !== undefined) {
              setOwnUser(res1.data.ownuser);
            }
          }
          return res1.data;
        } else {
          return res.data;
        }
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Check Your Internet",
        text1Style: { fontSize: 16, color: "red" },
        text2: "Internet may have gone wrong",
      });
      return { success: false, message: "No Internet Connection", data: err };
    }
  };

  return <AuthContext.Provider value={{ ownUser, mrDriverPartnerSignin, mrDriverPartnerSignup, mrDriverPartnerLogout, mrDriverRefreshToken, authPostFetch, accessToken, isInitLoading, eventLoading, pushToken, deviceID, pendingNotification, initialRoute, updateDriverStatus, isOnline, rating, totalRatings }}>{children}</AuthContext.Provider>;
};
