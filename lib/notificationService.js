import notifee, { AndroidImportance, EventType, AndroidStyle, AndroidCategory } from "@notifee/react-native";

const NOTIFICATION_ID = "ALARM_NOTIFICATION";
const ALARM_CHANNEL_ID = "alarm_ride_assigned_v1";
const NORMAL_CHANNEL_ID = "general_notifications_v1";

export async function displayNotification(remoteMessage) {
  const isRideAssigned = remoteMessage.notification?.title === "New Ride Assigned";

  await notifee.requestPermission();

  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: "Ride Assigned Alerts",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
  });

  await notifee.createChannel({
    id: NORMAL_CHANNEL_ID,
    name: "General Notifications",
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title: remoteMessage.notification?.title ?? "🚨 New update",
    body: remoteMessage.notification?.body ?? "Tap STOP to silence",
    android: {
      channelId: isRideAssigned ? ALARM_CHANNEL_ID : NORMAL_CHANNEL_ID,
      category: isRideAssigned ? AndroidCategory.ALARM : AndroidCategory.MESSAGE,
      importance: isRideAssigned ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
      sound: "default",
      loopSound: isRideAssigned,
      autoCancel: !isRideAssigned,
      ongoing: isRideAssigned,
      smallIcon: "ic_launcher",
      color: "#4A90E2",
      pressAction: {
        id: "default",
      },
      actions: isRideAssigned
        ? [
            {
              title: "🛑 Stop",
              pressAction: { id: "STOP_SOUND" },
            },
          ]
        : [],
      data: remoteMessage.data || {},
    },
    style: {
      type: AndroidStyle.BIGTEXT,
      text: remoteMessage.notification?.body,
    },
    data: remoteMessage.data || {},
  });

  if (isRideAssigned) {
    setTimeout(async () => {
      await notifee.cancelNotification(NOTIFICATION_ID);
    }, 15000);
  }
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
