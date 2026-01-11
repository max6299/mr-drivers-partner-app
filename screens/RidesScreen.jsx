import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View, StyleSheet, SectionList, ActivityIndicator } from "react-native";
import { useRide } from "../context/useRide";
import appStyle from "../lib/style";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const PRIMARY = "#0193e0";

const { Colors, Fonts } = appStyle;

const getRideDuration = (start, end) => {
  if (!start) return "--";

  const startTime = new Date(start);
  const endTime = end ? new Date(end) : new Date();

  const diffMs = endTime - startTime;
  if (diffMs <= 0) return "--";

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const groupRidesByDate = (rides = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sections = {
    Today: [],
    Earlier: [],
  };

  rides.forEach((ride) => {
    if (!ride.rideStartTime) {
      sections.Earlier.push(ride);
      return;
    }

    const rideDate = new Date(ride.rideStartTime);
    rideDate.setHours(0, 0, 0, 0);

    if (rideDate.getTime() === today.getTime()) {
      sections.Today.push(ride);
    } else {
      sections.Earlier.push(ride);
    }
  });

  return Object.entries(sections)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({
      title,
      data,
    }));
};

function RideCard({ ride }) {
  const statusMap = {
    completed: {
      bg: Colors.emerald_50,
      text: Colors.emerald_700,
      label: "Completed",
    },
    cancelled: {
      bg: Colors.alizarin_50,
      text: Colors.alizarin_600,
      label: "Cancelled",
    },
    ongoing: {
      bg: Colors.peter_river_50,
      text: Colors.peter_river_600,
      label: "Ongoing",
    },
  };

  const status = statusMap[ride.status];
  const isOngoing = ride.status === "ongoing";

  const formatIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (iso) => {
    if (!iso) return "Ongoing";

    const d = new Date(iso);

    const month = d.toLocaleString("en-US", { month: "short" }); 

    return `${d.getDate()} ${month} ${d.getFullYear()}`;
  };

  return (
    <TouchableOpacity activeOpacity={0.92} style={[styles.card, isOngoing && styles.priorityCard]}>
      {isOngoing && <View style={styles.priorityStrip} />}

      <View style={styles.headerRow}>
        <Text style={styles.rideIdTop}>Ride ID • {ride.rideId}</Text>

        <View style={[styles.statusBadge, { backgroundColor: status?.bg }]}>
          <Text style={[styles.statusText, { color: status?.text }]}>{status?.label}</Text>
        </View>
      </View>

      <View style={styles.routeBlock}>
        <Text style={styles.locationLabel}>Location</Text>
        <Text style={styles.locationText}>{ride.origin?.name}</Text>
      </View>

      <View style={styles.bottomRow}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.GoogleSansFlex,
            color: "#6B7280",
            fontWeight: "500",
          }}
        >
          {formatDate(ride.rideEndTime)}
        </Text>
        <Text style={styles.time}>
          {formatIST(ride.rideStartTime)} – {ride.rideEndTime ? formatIST(ride.rideEndTime) : "Now"}
        </Text>

        <View style={styles.distanceChip}>
          <Ionicons name="time-outline" size={12} color={Colors.peter_river_600} />
          <Text style={styles.distanceText}>{getRideDuration(ride.rideStartTime, ride.rideEndTime)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RidesScreen() {
  const { ridePostFetch } = useRide();
  const [rideHistory, setRideHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(false);

  const fetchRideHistory = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await ridePostFetch("driver/getRideHistory", { limit: 10, page });

      if (res.success) {
        if (res.history.length === 0) {
          setHasMore(false);
          return;
        }

        if (!res.hasMore) {
          Toast.show({
            type: "info",
            text1: "You're all caught up 🎉",
            text2: "No more rides to show",
          });
        }

        setRideHistory((prev) => {
          const ids = new Set(prev.map((r) => r._id));
          const newItems = res.history.filter((r) => !ids.has(r._id));
          return [...prev, ...newItems];
        });

        setHasMore(res.hasMore);
        setPage((prev) => prev + 1);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to load ride history",
          text2: res.message || "Please try again later",
        });
      }
    } catch (err) {
      console.error("Failed to fetch your ride history:", err);
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Unable to fetch ride history",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const sections = useMemo(() => {
    if (!rideHistory || rideHistory.length === 0) {
      return [];
    }
    return groupRidesByDate(rideHistory);
  }, [rideHistory]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchRideHistory();
    }
  };

  useEffect(() => {
    fetchRideHistory();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <Text style={styles.subtitle}>Track all your previous rides</Text>
      </View>

      {rideHistory.length > 0 || loading ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <RideCard ride={item} />}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (!onEndReachedCalledDuringMomentum.current) {
              loadMore();
              onEndReachedCalledDuringMomentum.current = true;
            }
          }}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator style={{ paddingVertical: 20 }} size="small" color={PRIMARY} /> : null}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No previous ride history available.</Text>
        </View>
      )}
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

  listContent: {
    paddingHorizontal: 14,
  },

  title: {
    fontSize: 26,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "700",
    color: Colors.midnight_blue_900,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  card: {
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

  priorityCard: {
    borderWidth: 1.5,
    borderColor: Colors.peter_river_300,
    backgroundColor: Colors.peter_river_50,
  },

  priorityStrip: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderRadius: 4,
    backgroundColor: Colors.peter_river_600,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#E3EEFA",
    accentColor: "#3A7BD5",
    textColor: "#243B5A",
  },

  rideIdTop: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.concrete,
    fontWeight: "500",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
  },

  routeBlock: {
    marginTop: 6,
    marginBottom: 12,
  },

  locationLabel: {
    fontSize: 11,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  locationText: {
    fontSize: 15,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    lineHeight: 22,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.clouds_200,
  },

  time: {
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  distanceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.peter_river_50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  distanceText: {
    marginLeft: 4,
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.peter_river_600,
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
  sectionHeader: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.concrete,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
