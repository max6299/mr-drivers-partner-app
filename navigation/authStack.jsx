import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";
import CompleteProfileScreen from "../screens/CompleteProfileScreen";
import SetProfilePictureScreen from "../screens/SetProfilePictureScreen";
import DrivingLicenseScreen from "../screens/DrivingLicenseScreen";
import SubmitScreen from "../screens/SubmitScreen";
import TermsAndConditionsScreen from "../screens/TermsAndConditionsScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import VerifForgotPasswordOTP from "../screens/VerifyForgotPasswordOTP";
import SetNewPasswordScreen from "../screens/SetNewPassword";
import RejectedScreen from "../screens/RejectedScreen";

const Stack = createStackNavigator();

function AuthStack({ initialRoute }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.ModalFadeTransition,
      }}
      initialRouteName={initialRoute}
    >
      <Stack.Screen name="home" component={HomeScreen} />
      <Stack.Screen name="sign-in" component={SignInScreen} />
      <Stack.Screen name="sign-up" component={SignUpScreen} />
      <Stack.Screen name="rejected" component={RejectedScreen} />
      <Stack.Screen name="verify-otp" component={VerifyOtpScreen} />
      <Stack.Screen name="verify-forgotpassword-otp" component={VerifForgotPasswordOTP} />
      <Stack.Screen name="update-password" component={SetNewPasswordScreen} />
      <Stack.Screen name="complete-profile" component={CompleteProfileScreen} />
      <Stack.Screen name="set-profile-pic" component={SetProfilePictureScreen} />
      <Stack.Screen name="add-driving-license" component={DrivingLicenseScreen} />
      <Stack.Screen name="submit-application" component={SubmitScreen} />
      <Stack.Screen name="forgot-password" component={ForgotPasswordScreen} />
      <Stack.Screen name="terms-and-conditions" component={TermsAndConditionsScreen} />
    </Stack.Navigator>
  );
}

export default AuthStack;
