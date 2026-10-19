import React, { useState, useEffect, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
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
import { useTheme } from '../theme/ThemeContext';
import { useEnvironment } from '../context/EnvironmentContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, opacity: color === colors.primary ? 1 : 0.5 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, opacity: color === colors.primary ? 1 : 0.5 }}>🚗</Text> }}
      />
      <Tab.Screen
        name="Drivers"
        component={DriversScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, opacity: color === colors.primary ? 1 : 0.5 }}>🧑‍✈️</Text> }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, opacity: color === colors.primary ? 1 : 0.5 }}>☰</Text> }}
      />
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
