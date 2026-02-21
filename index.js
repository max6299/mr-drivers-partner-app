import { registerRootComponent } from 'expo';
import { getApp } from "@react-native-firebase/app";
import { getMessaging, setBackgroundMessageHandler } from "@react-native-firebase/messaging";

import App from './App';
import { displayNotification } from "./lib/notificationService";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
try {
  const messagingInstance = getMessaging(getApp());
  setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
    await displayNotification(remoteMessage);
  });
} catch (error) {
  console.log("Background messaging init error", error);
}

registerRootComponent(App);
