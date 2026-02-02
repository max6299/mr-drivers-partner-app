import notifee, { AndroidImportance, EventType, AndroidStyle } from "@notifee/react-native";

export async function displayNotification(remoteMessage) {
  await notifee.requestPermission();

  const channelId = await notifee.createChannel({
    id: "default",
    name: "General Notifications",
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? "New update",
    body: remoteMessage.notification?.body ?? "",
    android: {
      channelId,
      smallIcon: "ic_launcher",
      color: "#4A90E2",
      pressAction: {
        id: "default",
        
      },
    },
    style: {
      type: AndroidStyle.BIGTEXT,
      text: remoteMessage.notification?.body,
    },
    importance: AndroidImportance.HIGH,
    category: "message",
    autoCancel: true,
    data: remoteMessage.data || {},
  });
}

export function registerNotificationClicks(onPress) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (data) {
        onPress(data);
      }
    }
  });
}
