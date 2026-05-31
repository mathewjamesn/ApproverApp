import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import OTPScreen from '../screens/Auth/OTPScreen';
import HomeScreen from '../screens/Main/HomeScreen';
import TripsScreen from '../screens/Main/TripsScreen';
import DriversScreen from '../screens/Main/DriversScreen';
import MenuScreen from '../screens/Main/MenuScreen';
import TripDetailsScreen from '../screens/Main/TripDetailsScreen';
import DriverDetailsScreen from '../screens/Main/DriverDetailsScreen';
import DriverVerificationDetailsScreen from '../screens/Main/DriverVerificationDetailsScreen';
import { useTheme } from '../theme/ThemeContext';

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
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setInitialRoute('Main');
        }
      } catch (e) {
        // error reading token
      }
      setIsLoading(false);
    };
    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false
    }} initialRouteName={initialRoute}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="DriverVerificationDetails" component={DriverVerificationDetailsScreen} />
    </Stack.Navigator>
  );
}
