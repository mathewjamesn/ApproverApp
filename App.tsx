import React from 'react';
import { StatusBar, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { navRef, syncCurrentRoute } from './src/nav';
import { PrototypeFab, Toast } from './src/ui/Chrome';
import IndexScreen from './src/screens/index';
import AirportScreen from './src/screens/airport';
import ApprovalsScreen from './src/screens/approvals';
import DriverScreen from './src/screens/driver';
import DriverLocationScreen from './src/screens/driver-location';
import EnvironmentScreen from './src/screens/environment';
import FareScreen from './src/screens/fare';
import FindScreen from './src/screens/find';
import HomeScreen from './src/screens/home';
import LoginScreen from './src/screens/login';
import MoreScreen from './src/screens/more';
import NotifyScreen from './src/screens/notify';
import OtpScreen from './src/screens/otp';
import OtpLookupScreen from './src/screens/otp-lookup';
import PassengerScreen from './src/screens/passenger';
import PrototypeScreen from './src/screens/prototype';
import ReportsScreen from './src/screens/reports';
import ReviewScreen from './src/screens/review';
import TripDetailScreen from './src/screens/trip-detail';
import TripsScreen from './src/screens/trips';

const Stack = createNativeStackNavigator();
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.ground } };
const tab = { animation: 'none' } as const;

/** Every screen sits in one stack; the tab bar is drawn by the four tab screens themselves. */
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1, backgroundColor: colors.ground }}>
        <NavigationContainer ref={navRef} theme={theme} onReady={syncCurrentRoute} onStateChange={syncCurrentRoute}>
          <Stack.Navigator initialRouteName="index" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
            <Stack.Screen name="index" component={IndexScreen} />
            <Stack.Screen name="login" component={LoginScreen} />
            <Stack.Screen name="otp" component={OtpScreen} />
            <Stack.Screen name="home" component={HomeScreen} options={tab} />
            <Stack.Screen name="approvals" component={ApprovalsScreen} options={tab} />
            <Stack.Screen name="trips" component={TripsScreen} options={tab} />
            <Stack.Screen name="more" component={MoreScreen} options={tab} />
            <Stack.Screen name="review" component={ReviewScreen} />
            <Stack.Screen name="trip-detail" component={TripDetailScreen} />
            <Stack.Screen name="find" component={FindScreen} />
            <Stack.Screen name="driver" component={DriverScreen} />
            <Stack.Screen name="driver-location" component={DriverLocationScreen} />
            <Stack.Screen name="passenger" component={PassengerScreen} />
            <Stack.Screen name="reports" component={ReportsScreen} />
            <Stack.Screen name="otp-lookup" component={OtpLookupScreen} />
            <Stack.Screen name="notify" component={NotifyScreen} />
            <Stack.Screen name="fare" component={FareScreen} />
            <Stack.Screen name="airport" component={AirportScreen} />
            <Stack.Screen name="environment" component={EnvironmentScreen} />
            <Stack.Screen name="prototype" component={PrototypeScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
        <PrototypeFab />
      </View>
    </SafeAreaProvider>
  );
}
