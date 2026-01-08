import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import RidesScreen from "./RidesScreen";
import NotificationsScreen from "./NotificationsScreen";
import ProfileScreen from "./ProfileScreen";
import FindRideScreen from "./FindRideScreen";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Fonts } from "../lib/style";

const Tabs = createBottomTabNavigator();
const PRIMARY = "#0193e0";

function renderTabIcon(routeName, focused) {
  let iconName = "";
  let label = "";
  let iconLibrary = "ion";

  switch (routeName) {
    case "find-ride":
      iconName = focused ? "car" : "car-outline";
      label = "Find Ride";
      break;

    case "rides":
      iconName = "history";
      label = "Rides";
      iconLibrary = "material";
      break;

    case "notifications":
      iconName = focused ? "notifications" : "notifications-outline";
      label = "Updates";
      break;

    case "profile-screen":
      iconName = focused ? "person" : "person-outline";
      label = "Profile";
      break;
  }

  return <TabIcon iconLibrary={iconLibrary} name={iconName} label={label} focused={focused} color={focused ? PRIMARY : "#9CA3AF"} size={24} />;
}

const TabIcon = ({ iconLibrary, name, label, focused, color, size }) => {
  const IconComponent = iconLibrary === "material" ? MaterialIcons : Ionicons;

  return (
    <View style={styles.tabIconContainer}>
      <IconComponent name={name} size={size} color={color} />
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export default function DashboardTabs() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: [styles.tabBar],
          tabBarIcon: ({ focused }) => renderTabIcon(route.name, focused),
        })}
      >
        <Tabs.Screen name="find-ride" component={FindRideScreen} />
        <Tabs.Screen name="rides" component={RidesScreen} />
        <Tabs.Screen name="notifications" component={NotificationsScreen} />
        <Tabs.Screen name="profile-screen" component={ProfileScreen} />
      </Tabs.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.whiteColor,
    borderTopWidth: 1,
    borderTopColor: Colors.clouds_300,

    height: 64,
    paddingTop: 6,

    elevation: 0,
    shadowOpacity: 0,
  },

  tabIconContainer: {
    flex: 1,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: Fonts.GoogleSansFlex,
    fontWeight: "500",
    color: Colors.concrete,
    textAlign: "center",
  },

  tabLabelFocused: {
    color: PRIMARY,
    fontWeight: "700",
  },
});
