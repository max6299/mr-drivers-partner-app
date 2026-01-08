import React from "react";
import { FlatList, StatusBar, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/useAuth";
import { useRide } from "../context/useRide";

const PRIMARY = "#0193e0";

function RideCard({ ride }) {
  const statusStyles = {
    completed: {
      bg: "#ECFDF5",
      text: "#16A34A",
      label: "Completed",
    },
    cancelled: {
      bg: "#FEF2F2",
      text: "#EF4444",
      label: "Cancelled",
    },
    ongoing: {
      bg: "#EFF6FF",
      text: "#2563EB",
      label: "Ongoing",
    },
  };

  const status = statusStyles[ride.status] || {
    bg: "#F3F4F6",
    text: "#6B7280",
    label: ride.status || "Unknown",
  };

  const formatIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.rideId}>{ride.rideId}</Text>

        <Text style={styles.route} numberOfLines={1}>
          {ride.origin?.name || "Pickup"} → {ride.destination?.name || "Drop"}
        </Text>

        <Text style={styles.time}>
          {formatIST(ride.rideStartTime)} – {formatIST(ride.rideEndTime)}
        </Text>
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>

          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{ride.distancekm != null ? `${Number(ride.distancekm).toFixed(1)} km` : "-- km"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function RidesScreen() {
  const { rideHistory } = useRide();
  console.log("ride", rideHistory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Ride History</Text>
        <Text style={styles.subtitle}>Your past trips and their status</Text>
      </View>

      {rideHistory.length > 0 ? (
        <FlatList data={rideHistory} keyExtractor={(item) => item._id} renderItem={({ item }) => <RideCard ride={item} />} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent} />
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
    backgroundColor: "#F9FAFB",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "interBold",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "interMedium",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardTop: {
    marginBottom: 8,
  },

  rideId: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  route: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "interSemiBold",
  },

  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "interMedium",
  },

  cardBottom: {
    marginTop: 12,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 12,
    fontFamily: "interSemiBold",
  },

  distanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
  },

  distanceText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontFamily: "interSemiBold",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: "interMedium",
  },
});
