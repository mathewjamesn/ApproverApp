import React, { useState, useEffect, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import OTPScreen from '../screens/Auth/OTPScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import TripsScreen from '../screens/Main/TripsScreen';
import DriversScreen from '../screens/Main/DriversScreen';
import MenuScreen from '../screens/Main/MenuScreen';
import PassengersScreen from '../screens/Main/PassengersScreen';
import TripDetailsScreen from '../screens/Main/TripDetailsScreen';
import DriverDetailsScreen from '../screens/Main/DriverDetailsScreen';
import DriverLocationScreen from '../screens/Main/DriverLocationScreen';
import DriverVerificationDetailsScreen from '../screens/Main/DriverVerificationDetailsScreen';
import GetOTPScreen from '../screens/Main/GetOTPScreen';
import AirportFareMultiplierScreen from '../screens/Main/AirportFareMultiplierScreen';
import FareMultiplierScreen from '../screens/Main/FareMultiplierScreen';
import SendNotificationScreen from '../screens/Main/SendNotificationScreen';
import AddOnDetailsScreen from '../screens/Main/AddOnDetailsScreen';
import DriverUpdateScreen from '../screens/Main/DriverUpdateScreen';
import DriverViewDetailsScreen from '../screens/Main/DriverViewDetailsScreen';
import DriverTripsScreen from '../screens/Main/DriverTripsScreen';
import ReportsScreen from '../screens/Main/ReportsScreen';
import OnlineDriversByCityScreen from '../screens/Main/OnlineDriversByCityScreen';
import TopOnlineDriversScreen from '../screens/Main/TopOnlineDriversScreen';
import MissedRequestsScreen from '../screens/Main/MissedRequestsScreen';
import LiveMapScreen from '../screens/Main/LiveMapScreen';
import ReservationsScreen from '../screens/Main/ReservationsScreen';
import ReservationDetailsScreen from '../screens/Main/ReservationDetailsScreen';
import AssignReservationDriverScreen from '../screens/Main/AssignReservationDriverScreen';
import ReservationCancellationsScreen from '../screens/Main/ReservationCancellationsScreen';
import { useTheme } from '../theme/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ glyph, focused }: { glyph: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{glyph}</Text>
);

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          borderRadius: 28,
          height: 66,
          marginHorizontal: 14,
          marginBottom: Math.max(insets.bottom, 12) + 14,
          paddingTop: 6,
          paddingBottom: 6,
          elevation: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 14,
        },
        tabBarItemStyle: { borderRadius: 22, marginHorizontal: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarActiveBackgroundColor: '#C6F68D',
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#A8A8A8',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} /> }} />
      <Tab.Screen name="Trips" component={TripsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="🚗" focused={focused} /> }} />
      <Tab.Screen name="Drivers" component={DriversScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="🧑‍✈️" focused={focused} /> }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon glyph="☰" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();
  const { isEnvironmentReady } = useEnvironment();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
    } catch {
      // error reading token — default to unauthenticated
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  if (isLoading || !isEnvironmentReady) {
    // Use the same background color as the app to prevent white flash
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Prevents the default slide animation which causes flickering on some Android devices
        animation: 'fade',
      }}
      initialRouteName={isAuthenticated ? 'Main' : 'Login'}
    >
      {/* Auth screens — no animation between them for a smooth OTP flow */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'fade' }} />
      <Stack.Screen name="Passengers" component={PassengersScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="DriverLocation" component={DriverLocationScreen} />
      <Stack.Screen name="DriverVerificationDetails" component={DriverVerificationDetailsScreen} />
      <Stack.Screen name="GetOTP" component={GetOTPScreen} />
      <Stack.Screen name="AirportFareMultiplier" component={AirportFareMultiplierScreen} />
      <Stack.Screen name="FareMultiplier" component={FareMultiplierScreen} />
      <Stack.Screen name="SendNotification" component={SendNotificationScreen} />
      <Stack.Screen name="AddOnDetails" component={AddOnDetailsScreen} />
      <Stack.Screen name="DriverUpdate" component={DriverUpdateScreen} />
      <Stack.Screen name="DriverViewDetails" component={DriverViewDetailsScreen} />
      <Stack.Screen name="DriverTrips" component={DriverTripsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="OnlineDriversByCity" component={OnlineDriversByCityScreen} />
      <Stack.Screen name="TopOnlineDrivers" component={TopOnlineDriversScreen} />
      <Stack.Screen name="MissedRequests" component={MissedRequestsScreen} />
      <Stack.Screen name="LiveMap" component={LiveMapScreen} />
      <Stack.Screen name="Reservations" component={ReservationsScreen} />
      <Stack.Screen name="ReservationDetails" component={ReservationDetailsScreen} />
      <Stack.Screen name="AssignReservationDriver" component={AssignReservationDriverScreen} />
      <Stack.Screen name="ReservationCancellations" component={ReservationCancellationsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
