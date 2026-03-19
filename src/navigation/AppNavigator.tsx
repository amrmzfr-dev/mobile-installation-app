import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../features/auth/screens/SplashScreen';
import SignInScreen from '../features/auth/screens/SignInScreen';
import MainTabNavigator from './MainTabNavigator';
import JobDetailScreen from '../features/jobs/screens/JobDetailScreen';
import HomeSurveyFormScreen from '../features/jobs/screens/HomeSurveyFormScreen';
import InstallationFormScreen from '../features/jobs/screens/InstallationFormScreen';
import InvoiceDetailScreen from '../features/billing/screens/InvoiceDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="HomeSurveyForm" component={HomeSurveyFormScreen} />
      <Stack.Screen name="InstallationForm" component={InstallationFormScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
  );
}
