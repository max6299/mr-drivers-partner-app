import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";

const PRIMARY = "#0193e0";

const notificationIconMap = {
  accepted: "checkmark-circle",
  cancelled: "close-circle",
  payment: "card",
  completed: "flag",
  booked: "car",
  ongoing: "time",
};

const formatNotifications = (notifs = []) =>
  notifs.map((n) => ({
    id: n._id,
    title: n.title,
    message: n.message,
    icon: notificationIconMap[n.type] || "notifications-outline",
    time: new Date(n.createdAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }),
  }));

const defaultWelcomeNotification = {
  id: "default-welcome",
  title: "Welcome!",
  message: "Thanks for joining our community. Enjoy safe rides!",
  time: "Today",
  icon: "happy-outline",
};

function NotificationCard({ item }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name={item.icon} size={20} color={PRIMARY} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { notifications = [] } = useAuth();

  const formatted = formatNotifications(notifications);
  const finalList = [...formatted, defaultWelcomeNotification];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>Notifications</Text>
        <Text style={styles.screenSubtitle}>Stay updated with your ride activity</Text>
      </View>

      <FlatList data={finalList} keyExtractor={(item) => item.id} renderItem={({ item }) => <NotificationCard item={item} />} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "interBold",
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "interMedium",
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    marginTop: 8,
  },

  /* Card */
  card: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontFamily: "interSemiBold",
  },

  time: {
    marginLeft: 8,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "interMedium",
  },

  message: {
    marginTop: 4,
    fontSize: 14,
    color: "#4B5563",
    fontFamily: "interRegular",
    lineHeight: 20,
  },
});
