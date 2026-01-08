import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRide } from "../context/useRide";
import { Colors, Fonts } from "../lib/style";

const PRIMARY = "#0193e0";

const notificationIconMap = {
  accepted: { icon: "checkmark-circle", color: Colors.emerald_600, bg: Colors.emerald_50 },
  cancelled: { icon: "close-circle", color: Colors.alizarin_600, bg: Colors.alizarin_50 },
  payment: { icon: "card", color: Colors.peter_river_600, bg: Colors.peter_river_50 },
  completed: { icon: "flag", color: Colors.turquoise_600, bg: Colors.turquoise_50 },
  booked: { icon: "car", color: Colors.amethyst_600, bg: Colors.amethyst_50 },
  ongoing: { icon: "time", color: Colors.orange_600, bg: Colors.orange_50 },
};
const formatNotifications = (notifs = []) =>
  notifs.map((n) => ({
    id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    time: new Date(n.createdAt).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }));

const defaultWelcomeNotification = {
  id: "default-welcome",
  title: "Welcome!",
  message: "Thanks for joining our community. Enjoy safe rides!",
  type: "booked",
  time: "Today",
};

function NotificationCard({ item }) {
  const meta = notificationIconMap[item.type] || {
    icon: "notifications-outline",
    color: Colors.asbestos,
    bg: Colors.clouds_400,
  };

  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.card}>
      <View style={[styles.iconWrapper, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={22} color={meta.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
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
  const { notifications, getNotifications, setNotifications } = useRide();

  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(false);

  const loadMoreNotifications = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    const res = await getNotifications(10, page);

    if (res?.notifications?.length > 0) {
      setNotifications((prev) => [...prev, ...res.notifications]);
      setPage((prev) => prev + 1);
      setHasMore(res.hasMore);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (notifications.length === 0 && page === 2) {
      loadMoreNotifications();
    }
  }, [notifications, page]);

  const formatted = useMemo(() => formatNotifications(notifications), [notifications]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.screenTitle}>Notifications</Text>
        <Text style={styles.screenSubtitle}>Stay updated with your ride activity</Text>
      </View>

      <FlatList
        data={formatted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            loadMoreNotifications();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          <>
            {loading && <Text style={styles.loading}>Loading...</Text>}
            <NotificationCard item={defaultWelcomeNotification} />
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bodyBackColor,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  screenTitle: {
    fontSize: 26,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 30,
  },

  card: {
    flexDirection: "row",
    backgroundColor: Colors.whiteColor,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    marginRight: 10,
  },

  time: {
    fontSize: 11,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.concrete,
  },

  message: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    lineHeight: 20,
  },

  loading: {
    textAlign: "center",
    paddingVertical: 20,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },
});
