import React, { useEffect, useRef, useState } from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import { useRide } from "../context/useRide";
import appStyle from "../lib/style";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { Colors, Fonts } = appStyle;

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

  const formatIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <TouchableOpacity activeOpacity={0.92} style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.route} numberOfLines={1}>
          {ride.origin?.name} → {ride.destination?.name}
        </Text>

        <View style={[styles.statusBadge, { backgroundColor: status?.bg }]}>
          <Text style={[styles.statusText, { color: status?.text }]}>{status?.label}</Text>
        </View>
      </View>

      <Text style={styles.time}>
        {formatIST(ride.rideStartTime)} – {formatIST(ride.rideEndTime)}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.rideId}>Ride ID • {ride.rideId}</Text>

        <View style={styles.distanceChip}>
          <Text style={styles.distanceText}>{ride.distancekm?.toFixed(1)} km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RidesScreen() {
  const { rideHistory, getRideHistory } = useRide();
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(false);

  const loadMoreHistory = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    const res = await getRideHistory(10, page);

    if (res?.history?.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      setHasMore(nextPage <= res.pagination.totalPages);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (rideHistory.length === 0 && page === 2) {
      loadMoreHistory();
    }
  }, [rideHistory, page]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <Text style={styles.subtitle}>Track all your previous rides</Text>
      </View>

      {rideHistory.length > 0 || loading ? (
        <FlatList
          data={rideHistory}
          keyExtractor={(item) => item._id}
          onEndReached={() => {
            if (!onEndReachedCalledDuringMomentum.current) {
              loadMoreHistory();
              onEndReachedCalledDuringMomentum.current = true;
            }
          }}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => <RideCard ride={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={loading ? <Text style={{ textAlign: "center" }}>Loading...</Text> : null}
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

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  route: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    color: Colors.midnight_blue_900,
    marginRight: 10,
  },

  time: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.asbestos,
  },

  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rideId: {
    fontSize: 11,
    fontFamily: Fonts.GoogleSansFlex,
    color: Colors.concrete,
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

  distanceChip: {
    // backgroundColor: Colors.turquoise_50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  distanceText: {
    fontSize: 12,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "600",
    // color: Colors.turquoise_700,
  },
});
