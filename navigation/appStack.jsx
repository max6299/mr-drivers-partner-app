import React from "react";
import { Text, View } from "react-native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import HelpCenterScreen from "../screens/HelpCenterScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AccountDetailsScreen from "../screens/AccountDetailsScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import PaymentScreen from "../screens/PaymentScreen";
import ViewDocumentsScreen from "../screens/ViewDocumentsScreen";
import DashboardTabs from "../screens/DashboardTabs";
import TermsAndConditionsScreenProfile from "../screens/TermsAndConditionsProfile";
import LegalPagesScreen from "../screens/LeagalPagesScreen";

const Stack = createStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.ModalFadeTransition,
      }}
    >
      <Stack.Screen name="dashboard" component={DashboardTabs} />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen name="view-documents" component={ViewDocumentsScreen} />
      <Stack.Screen name="payment" component={PaymentScreen} />
      <Stack.Screen name="profile-details" component={AccountDetailsScreen} />
      <Stack.Screen name="edit-profile" component={EditProfileScreen} />
      <Stack.Screen name="privacy-policy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="legal-pages" component={LegalPagesScreen} />
      <Stack.Screen name="terms-profile" component={TermsAndConditionsScreenProfile} />
      <Stack.Screen name="help-center" component={HelpCenterScreen} />
      {/* <Stack.Screen name="customer-otp" component={CustomerOtpS} /> */}
    </Stack.Navigator>
  );
}

export default AppStack;
