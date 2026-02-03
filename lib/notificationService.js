import notifee, { AndroidImportance, EventType, AndroidStyle, AndroidCategory } from "@notifee/react-native";

const NOTIFICATION_ID = "ALARM_NOTIFICATION";
const CHANNEL_ID = "alarm_general_v1";

export async function displayNotification(remoteMessage) {
  await notifee.requestPermission();

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: "Alarm Notifications",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
  });

  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: remoteMessage.notification?.title ?? "🚨 New update",
    body: remoteMessage.notification?.body ?? "Tap STOP to silence",
    android: {
      channelId : CHANNEL_ID,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      sound: "default",
      loopSound: true,
      autoCancel: false,
      ongoing: true,
      smallIcon: "ic_launcher",
      color: "#4A90E2",
      pressAction: {
        id: "default",
      },
      actions: [
        {
          title: "🛑 Stop",
          pressAction: {
            id: "STOP_SOUND",
          },
        },
      ],
      data: remoteMessage.data || {},
    },
    style: {
      type: AndroidStyle.BIGTEXT,
      text: remoteMessage.notification?.body,
    },
    data: remoteMessage.data || {},
  });
  setTimeout(async () => {
    await notifee.cancelNotification(NOTIFICATION_ID);
  }, 10000);
}

export function registerNotificationClicks(onPress) {
  return notifee.onForegroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      if (detail.pressAction.id === "STOP_SOUND") {
        await notifee.cancelNotification(NOTIFICATION_ID);
        return;
      }
    }

    if (type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (data) {
        onPress(data);
      }
    }
  });
}
