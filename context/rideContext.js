import axios from "axios";
import { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

export const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [coords, setCoords] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [assignedRides, setAssignedRides] = useState([]);
  const [ongoingRide, setOngoingRide] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [currentRide, setCurrentRide] = useState(null);
  const [otp, setOtp] = useState(null);
  const [rideHistory, setRideHistory] = useState(null);
  const [notificaitons, setNotificaitons] = useState(null);

  const timerRef = useRef();

  const { accessToken, mrDriverRefreshToken } = useAuth();

  const getRideHistory = async (limit, page) => {
    try {
      const res = await ridePostFetch("driver/getRideHistory", { limit, page });
      return res;
    } catch (err) {
      console.error("Failed to fetch your ride history:", err);
      return null;
    }
  };

  const getNotifications = async (limit, page) => {
    try {
      const res = await ridePostFetch("driver/getNotifications", { limit, page });
      return res;
    } catch (err) {
      console.error("Failed to fetch your ride history:", err);
      return null;
    }
  };

  const getAssignedRides = async () => {
    try {
      const res = await ridePostFetch("driver/getAssignedRides");
      return res;
    } catch (err) {
      console.error("Failed to fetch your rides:", err);
      return null;
    }
  };

  const startTimer = (startMs) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    const loadRides = async () => {
      if (!accessToken) return;

      const rides = await getAssignedRides();
      const history = await getRideHistory(10, 1);
      const notifications = await getNotifications(10, 1);

      setOngoingRide(rides.ongoingRide);
      setAssignedRides(rides.acceptedRides || []);
      setRideHistory(history || []);
      setNotificaitons(notifications);

      if (rides?.ongoingRide?.rideStartTime) {
        setStartTime(new Date(rides.ongoingRide.rideStartTime).getTime());
        startTimer(new Date(rides.ongoingRide.rideStartTime).getTime());

        setEndTime(Date.now());
      }
    };

    loadRides();
  }, [accessToken]);

  useEffect(() => {
    if (!startTime || endTime) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const formatTime = (seconds) => {
    const sec = Number(seconds);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };


  const mapboxDirections = async ({ origin, destination }) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/` + `${origin.longitude},${origin.latitude};` + `${destination.longitude},${destination.latitude}` + `?geometries=geojson&overview=full&access_token=${process.env.EXPO_PUBLIC_MAPBOX_TOKEN}`;

      const res = await axios.get(url);

      if (res?.data?.routes?.length > 0) {
        return res.data.routes[0].geometry.coordinates;
      }

      console.warn("No routes found");
      return [];
    } catch (error) {
      console.error("Mapbox error:", error.response?.data || error.message);
      return [];
    }
  };

  const ridePostFetch = async (url, options = {}) => {
    const config = {
      headers: { Authorization: "Bearer " + accessToken },
    };

    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}${url}`, options, config);
      if (res.data.success) {
        return res.data;
      } else {
        if (res.data.message == "Token Expired") {
          const newToken = await mrDriverRefreshToken();
          const config1 = {
            headers: { Authorization: "Bearer " + newToken },
          };
          const res1 = await axios.post(`${process.env.EXPO_PUBLIC_BASE_URL}${url}`, options, config1);
          if (res1.data.success) {
            return res1.data;
          }
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

  return (
    <RideContext.Provider
      value={{
        coords,
        setCoords,
        currentLocation,
        setCurrentLocation,
        isLoading,
        setIsLoading,
        permissionAsked,
        setPermissionAsked,
        assignedRides,
        setAssignedRides,
        ongoingRide,
        setOngoingRide,
        currentRide,
        setCurrentRide,
        rideHistory,
        setRideHistory,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        elapsed,
        setElapsed,
        otp,
        setOtp,
        getRideHistory,
        mapboxDirections,
        formatTime,
        ridePostFetch,
        startTimer,
        stopTimer,
        timerRef,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};
