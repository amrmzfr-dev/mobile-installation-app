import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from './types';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import JobsScreen from '../features/jobs/screens/JobsScreen';
import BillingScreen from '../features/billing/screens/BillingScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Dashboard: { active: 'grid', inactive: 'grid-outline' },
  Jobs: { active: 'briefcase', inactive: 'briefcase-outline' },
  Billing: { active: 'document-text', inactive: 'document-text-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export default function MainTabNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = TAB_ICONS[route.name];
          const name = focused ? icons.active : icons.inactive;
          return <Ionicons name={name} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'HOME' }} />
      <Tab.Screen name="Jobs" component={JobsScreen} options={{ tabBarLabel: 'JOBS' }} />
      <Tab.Screen name="Billing" component={BillingScreen} options={{ tabBarLabel: 'BILLING' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'PROFILE' }} />
    </Tab.Navigator>
  );
}
