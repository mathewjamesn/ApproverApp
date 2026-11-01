import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Linking, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { driverService, DriverLocation } from '../../../services/api/driverService';
import { getStyles } from './styles';

const REFRESH_INTERVAL_SECONDS = 8;

interface PassengerLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

const extractPassengerCoordinates = (address: any): PassengerLocation | null => {
  if (!address || typeof address !== 'object') return null;

  const lat = address?.geoLocation?.latitude ?? address?.latitude ?? address?.lat;
  const lng = address?.geoLocation?.longitude ?? address?.longitude ?? address?.lng;
  const locationName =
    address?.locationName || address?.address || address?.name || 'Passenger Pickup Location';

  const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
  const numLng = typeof lng === 'number' ? lng : parseFloat(lng);

  if (Number.isFinite(numLat) && Number.isFinite(numLng)) {
    return {
      latitude: numLat,
      longitude: numLng,
      locationName,
    };
  }

  return null;
};

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
  const rawPassengerAddress =
    route.params?.passengerFromAddress || tripData?.passengerFromAddress || tripData?.fromAddress;

  const passengerCoords = useMemo(
    () => extractPassengerCoordinates(rawPassengerAddress),
    [rawPassengerAddress]
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SECONDS);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);

  const locationRef = useRef<DriverLocation | null>(null);
  locationRef.current = location;

  const fetchRouteDetails = useCallback(
    async (driverLat: number, driverLong: number, pickupLat: number, pickupLong: number) => {
      // OSRM coordinates: {lon},{lat};{lon},{lat} with overview=full so route geometry is returned
      const lonLatUrl = `https://pikmecontainerapp.politemushroom-8a010def.southindia.azurecontainerapps.io/route/v1/driving/${driverLong},${driverLat};${pickupLong},${pickupLat}?overview=full&geometries=geojson`;
      const latLonUrl = `https://pikmecontainerapp.politemushroom-8a010def.southindia.azurecontainerapps.io/route/v1/driving/${driverLat},${driverLong};${pickupLat},${pickupLong}?overview=full&geometries=geojson`;

      let extractedCoords: Array<{ latitude: number; longitude: number }> = [];

      try {
        console.log('[Route API Request]', lonLatUrl);
        const res = await axios.get(lonLatUrl);
        console.log('[Route API Response]', res.data);

        const routeData = res.data?.routes?.[0];
        if (routeData?.geometry?.coordinates && Array.isArray(routeData.geometry.coordinates)) {
          extractedCoords = routeData.geometry.coordinates.map((pt: [number, number]) => ({
            latitude: pt[1],
            longitude: pt[0],
          }));
        }
      } catch (err: any) {
        console.log('[Route API Error]', err?.response?.data || err?.message || err);
        try {
          console.log('[Route API Request (fallback)]', latLonUrl);
          const fallbackRes = await axios.get(latLonUrl);
          console.log('[Route API Response (fallback)]', fallbackRes.data);

          const routeData = fallbackRes.data?.routes?.[0];
          if (routeData?.geometry?.coordinates && Array.isArray(routeData.geometry.coordinates)) {
            extractedCoords = routeData.geometry.coordinates.map((pt: [number, number]) => ({
              latitude: pt[1],
              longitude: pt[0],
            }));
          }
        } catch (fallbackErr: any) {
          console.log(
            '[Route API Fallback Error]',
            fallbackErr?.response?.data || fallbackErr?.message || fallbackErr
          );
        }
      }

      // If no road geometry returned (e.g. overview=false was sent or off-road), plot line directly between driver and pickup
      if (!extractedCoords.length) {
        extractedCoords = [
          { latitude: driverLat, longitude: driverLong },
          { latitude: pickupLat, longitude: pickupLong },
        ];
      }

      setRouteCoordinates(extractedCoords);
    },
    []
  );

  const fitMapToPoints = useCallback(
    (driverLoc: DriverLocation) => {
      if (!mapRef.current) return;

      if (passengerCoords) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: driverLoc.latitude, longitude: driverLoc.longitude },
            { latitude: passengerCoords.latitude, longitude: passengerCoords.longitude },
          ],
          {
            edgePadding: { top: 80, right: 80, bottom: 280, left: 80 },
            animated: true,
          }
        );
      } else {
        mapRef.current.animateToRegion(
          {
            latitude: driverLoc.latitude,
            longitude: driverLoc.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          600
        );
      }
    },
    [passengerCoords]
  );

  const fetchLocation = useCallback(
    async (isManualRefresh = false) => {
      if (!rawPhoneNumber || rawPhoneNumber === '--' || rawPhoneNumber.trim() === '') {
        setErrorMessage('Driver phone number not available.');
        setIsLoading(false);
        return;
      }

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else if (!locationRef.current) {
        setIsLoading(true);
      }
      setErrorMessage('');

      try {
        const response = await driverService.getDriverLocationDetails(rawPhoneNumber);
        if (!response) {
          if (!locationRef.current) {
            setErrorMessage('Live location details could not be found for this driver.');
          }
        } else {
          setLocation(response);
          // Auto fit on initial load or manual refresh
          if (!locationRef.current || isManualRefresh) {
            fitMapToPoints(response);
          }
        }
      } catch (err: any) {
        if (!locationRef.current) {
          const msg =
            err?.response?.data?.message || err?.message || 'Unable to load live location right now.';
          setErrorMessage(msg);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [rawPhoneNumber, fitMapToPoints]
  );

  // Initial load
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Periodic 8-second polling timer
  useEffect(() => {
    if (!rawPhoneNumber || rawPhoneNumber === '--' || rawPhoneNumber.trim() === '') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger 8-second interval refresh
          fetchLocation(false);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rawPhoneNumber, fetchLocation]);

  // Update route whenever driver location or passenger coords change
  useEffect(() => {
    if (location?.latitude && location?.longitude && passengerCoords) {
      fetchRouteDetails(
        location.latitude,
        location.longitude,
        passengerCoords.latitude,
        passengerCoords.longitude
      );
    }
  }, [location, passengerCoords, fetchRouteDetails]);

  const handleManualRefresh = () => {
    setCountdown(REFRESH_INTERVAL_SECONDS);
    fetchLocation(true);
  };

  const handleOpenExternalMaps = () => {
    if (!location) return;

    let url: string;
    if (passengerCoords) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${passengerCoords.latitude},${passengerCoords.longitude}&travelmode=driving`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open Google Maps');
    });
  };

  const handleCall = () => {
    const cleanPhone = (location?.mobileNumber || rawPhoneNumber).replace(/[^\d+]/g, '');
    if (cleanPhone) {
      Linking.openURL(`tel:${cleanPhone}`).catch((err) => console.log('Error opening dialer', err));
    }
  };

  const handleSms = () => {
    const cleanPhone = (location?.mobileNumber || rawPhoneNumber).replace(/[^\d+]/g, '');
    if (cleanPhone) {
      Linking.openURL(`sms:${cleanPhone}`).catch((err) => console.log('Error opening SMS', err));
    }
  };

  const initialRegion = location
    ? passengerCoords
      ? {
          latitude: (location.latitude + passengerCoords.latitude) / 2,
          longitude: (location.longitude + passengerCoords.longitude) / 2,
          latitudeDelta: Math.max(Math.abs(location.latitude - passengerCoords.latitude) * 1.8, 0.02),
          longitudeDelta: Math.max(Math.abs(location.longitude - passengerCoords.longitude) * 1.8, 0.02),
        }
      : {
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

        <View style={styles.headerRightActions}>
          <View style={styles.timerBadge}>
            <Text style={styles.timerBadgeText}>⏱️ {countdown}s</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshHeaderButton}
            onPress={handleManualRefresh}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primaryText} />
            ) : (
              <Text style={styles.refreshHeaderText}>🔄</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helperText}>Loading latest driver location...</Text>
        </View>
      ) : location && initialRegion ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            onMapReady={() => {
              if (location) {
                fitMapToPoints(location);
              }
            }}
          >
            {/* Plotted Route Polyline */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor={colors.primary}
              />
            )}

            {/* Driver Marker */}
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={driverName}
              description={`Driver: ${location.status || 'Active'}`}
            >
              <View style={styles.markerBadge}>
                <Text style={{ fontSize: 16 }}>🚗</Text>
                {/* <Text style={styles.markerText}>{driverName}</Text> */}
              </View>
            </Marker>

            {/* Passenger Pickup Marker */}
            {passengerCoords && (
              <Marker
                coordinate={{
                  latitude: passengerCoords.latitude,
                  longitude: passengerCoords.longitude,
                }}
                title="Pickup Location"
                description={passengerCoords.locationName}
              >
                <View style={styles.passengerMarkerBadge}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                  {/* <Text style={styles.markerText}>Pickup</Text> */}
                </View>
              </Marker>
            )}
          </MapView>

          <View style={[styles.locationCard, { marginBottom: (insets.bottom || 0) + 12 }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.locationTitle}>Live Tracking</Text>
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

            {/* Live 8-second auto-refresh countdown indicator */}
            <View style={styles.timerCardRow}>
              <View style={styles.timerPulseDot} />
              <Text style={styles.timerCardText}>
                Live tracking • Updates in{' '}
                <Text style={{ fontWeight: '700', color: colors.primary }}>{countdown}s</Text>
              </Text>
            </View>

            {/* Driver Info */}
            <View style={styles.driverInfoRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverNameText}>🚗 {driverName}</Text>
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

            {/* Passenger Pickup Info */}
            {passengerCoords && (
              <View style={styles.passengerSection}>
                <View style={styles.passengerHeader}>
                  <Text style={{ fontSize: 14 }}>👤</Text>
                  <Text style={styles.passengerTitle}>Pickup Location</Text>
                </View>
                <Text style={styles.passengerAddressText} numberOfLines={2}>
                  {passengerCoords.locationName}
                </Text>
              </View>
            )}

            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Driver Coords</Text>
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
                onPress={handleManualRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={{ fontSize: 15 }}>🔄</Text>
                    <Text style={styles.cardActionSecondaryText}>Refresh ({countdown}s)</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cardActionPrimary}
                onPress={handleOpenExternalMaps}
              >
                <Text style={{ fontSize: 15 }}>🗺️</Text>
                <Text style={styles.cardActionPrimaryText}>
                  {passengerCoords ? 'Route in Maps' : 'Open in Maps'}
                </Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={handleManualRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
