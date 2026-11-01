import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { driverService, DriverLocation } from '../../../services/api/driverService';
import { getStyles } from './styles';

const formatTimeDisplay = (dateStr?: string | null): string => {
  if (!dateStr) return '--';
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  return dateStr;
};

const formatDifferenceMinutes = (diff?: number): string => {
  if (diff === undefined || diff === null) return '';
  if (diff < 1) return 'Just now';
  const mins = Math.round(diff);
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m ago`;
};

export default function DriverLocationScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const mapRef = useRef<MapView | null>(null);

  const driverName = route.params?.driverName || 'Driver';
  const rawPhoneNumber = route.params?.phoneNumber || '';
  const screenTitle = route.params?.title || 'Track Driver Location';
  const tripData = route.params?.tripData;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchLocation = useCallback(async (isManualRefresh = false) => {
    if (!rawPhoneNumber || rawPhoneNumber === '--' || rawPhoneNumber.trim() === '') {
      setErrorMessage('Driver phone number not available.');
      setIsLoading(false);
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage('');

    try {
      const response = await driverService.getDriverLocationDetails(rawPhoneNumber);
      if (!response) {
        setErrorMessage('Live location details could not be found for this driver.');
      } else {
        setLocation(response);

        // Center map to new coordinates
        if (mapRef.current && response.latitude && response.longitude) {
          mapRef.current.animateToRegion({
            latitude: response.latitude,
            longitude: response.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }, 600);
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to load live location right now.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [rawPhoneNumber]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleOpenExternalMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open Google Maps');
    });
  };

  const handleCall = () => {
    const cleanPhone = (location?.mobileNumber || rawPhoneNumber).replace(/[^\d+]/g, '');
    if (cleanPhone) {
      Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
    }
  };

  const handleSms = () => {
    const cleanPhone = (location?.mobileNumber || rawPhoneNumber).replace(/[^\d+]/g, '');
    if (cleanPhone) {
      Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
    }
  };

  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }
    : undefined;

  const isOnline = (location?.status || '').toLowerCase() === 'online';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          <Text style={styles.headerSubtitle}>{driverName}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshHeaderButton}
          onPress={() => fetchLocation(true)}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primaryText} />
          ) : (
            <Text style={styles.refreshHeaderText}>🔄</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading latest driver location...</Text>
        </View>
      ) : location && region ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
          >
            {/* Driver Marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={driverName}
              description={`Status: ${location.status || 'Active'}`}
            >
              <View style={styles.markerBadge}>
                <Text style={{ fontSize: 16 }}>🚗</Text>
                <Text style={styles.markerText}>{driverName}</Text>
              </View>
            </Marker>

            {/* Optional Pickup Marker if available */}
            {tripData?.fromAddress?.latitude && tripData?.fromAddress?.longitude && (
              <Marker
                coordinate={{
                  latitude: tripData.fromAddress.latitude,
                  longitude: tripData.fromAddress.longitude,
                }}
                title="Pickup Location"
                description={tripData.fromLocation}
                pinColor="blue"
              />
            )}

            {/* Optional Destination Marker if available */}
            {tripData?.toAddress?.latitude && tripData?.toAddress?.longitude && (
              <Marker
                coordinate={{
                  latitude: tripData.toAddress.latitude,
                  longitude: tripData.toAddress.longitude,
                }}
                title="Drop Location"
                description={tripData.toLocation}
                pinColor="green"
              />
            )}
          </MapView>

          <View style={[styles.locationCard, { marginBottom: (insets.bottom || 0) + 12 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.locationTitle}>Driver Live Tracking</Text>
              <View style={styles.badgesRow}>
                {location.status ? (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isOnline ? colors.success + '20' : colors.textSecondary + '20',
                        borderColor: isOnline ? colors.success : colors.textSecondary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isOnline ? colors.success : colors.textSecondary },
                      ]}
                    >
                      ● {location.status}
                    </Text>
                  </View>
                ) : null}

                {location.isReadyForRide && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: colors.info + '20',
                        borderColor: colors.info,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: colors.info }]}>Ready</Text>
                  </View>
                )}

                {location.isBusy && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: '#F59E0B20',
                        borderColor: '#F59E0B',
                      },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: '#F59E0B' }]}>Busy</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.driverInfoRow}>
              <View>
                <Text style={styles.driverNameText}>{driverName}</Text>
                <Text style={styles.driverPhoneText}>
                  {location.mobileNumber || rawPhoneNumber || '--'}
                </Text>
              </View>
              <View style={styles.phoneActions}>
                <TouchableOpacity onPress={handleCall} style={styles.phoneActionBtn}>
                  <Text style={{ fontSize: 16 }}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSms} style={styles.phoneActionBtn}>
                  <Text style={{ fontSize: 16 }}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coordinates</Text>
                <Text style={styles.detailValue}>
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </Text>
              </View>

              {location.lastLocationUpdateTimeInLocalTime ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Updated</Text>
                  <Text style={styles.detailValue}>
                    {formatTimeDisplay(location.lastLocationUpdateTimeInLocalTime)}
                    {location.differenceInMinutes !== undefined
                      ? ` (${formatDifferenceMinutes(location.differenceInMinutes)})`
                      : ''}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.cardActionSecondary}
                onPress={() => fetchLocation(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={{ fontSize: 15 }}>🔄</Text>
                    <Text style={styles.cardActionSecondaryText}>Refresh</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardActionPrimary}
                onPress={handleOpenExternalMaps}
              >
                <Text style={{ fontSize: 15 }}>🗺️</Text>
                <Text style={styles.cardActionPrimaryText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.centerContent}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>📍</Text>
          <Text style={styles.errorTitle}>Location Unavailable</Text>
          <Text style={styles.helperText}>
            {errorMessage || 'Unable to retrieve the driver live location.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchLocation(false)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
