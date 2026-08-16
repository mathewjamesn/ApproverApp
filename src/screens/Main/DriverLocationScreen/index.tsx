import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { driverService, DriverLocation } from '../../../services/api/driverService';
import { getStyles } from './styles';

const DUMMY_LOCATION: DriverLocation = {
  latitude: 9.931233,
  longitude: 76.267303,
  raw: {
    source: 'dummy-preview',
    updatedAt: '2026-07-04T12:00:00Z',
  },
};

export default function DriverLocationScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const driverName = route.params?.driverName || 'Driver';
  const phoneNumber = route.params?.phoneNumber || '+91 98765 43210';

  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<DriverLocation | null>();
  const [errorMessage, setErrorMessage] = useState('');
  const [isUsingDummyData, setIsUsingDummyData] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!phoneNumber) {
        setErrorMessage('Driver location not available.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await driverService.getDriverLocationDetails(phoneNumber);
console.log('response', response);

        if (!response) {
          setErrorMessage('Live location not available. Showing preview data.');
          return;
        }

        setLocation(response);
        setIsUsingDummyData(false);
      } catch {
        setErrorMessage('Unable to load live location right now. Showing preview data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [phoneNumber]);

  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Locate Driver</Text>
          <Text style={styles.headerSubtitle}>{driverName}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading latest driver location...</Text>
        </View>
      ) : location && region ? (
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={region} region={region}>
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={driverName}
              description={phoneNumber}
            />
          </MapView>

          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Latest Coordinates</Text>
            {isUsingDummyData ? (
              <Text style={styles.previewBadge}>Preview data</Text>
            ) : null}
            <Text style={styles.locationValue}>Latitude: {location.latitude.toFixed(6)}</Text>
            <Text style={styles.locationValue}>Longitude: {location.longitude.toFixed(6)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={styles.locationValue}>Phone: {phoneNumber}</Text>
              {phoneNumber && phoneNumber !== '--' && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {errorMessage ? (
              <Text style={styles.previewHelper}>{errorMessage}</Text>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Location unavailable</Text>
          <Text style={styles.helperText}>{errorMessage || 'Driver location not available.'}</Text>
        </View>
      )}
    </View>
  );
}
