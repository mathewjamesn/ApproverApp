import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, Linking, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { driverService, DriverLocation } from '../../../services/api/driverService';
import { getStyles } from './styles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const REFRESH_INTERVAL_SECONDS = 8;

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
}

interface PassengerLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

const formatDistance = (meters?: number | null): string => {
  if (meters === undefined || meters === null) return '--';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds?: number | null): string => {
  if (seconds === undefined || seconds === null) return '--';
  if (seconds < 60) {
    return '< 1 min';
  }
  const totalMins = Math.round(seconds / 60);
  if (totalMins < 60) {
    return `${totalMins} min${totalMins > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;
  return remainingMins > 0 ? `${hours} hr ${remainingMins} min` : `${hours} hr`;
};

const calculateHaversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

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
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCardVisible, setIsCardVisible] = useState(false);

  const locationRef = useRef<DriverLocation | null>(null);
  locationRef.current = location;

  const fetchRouteDetails = useCallback(
    async (driverLat: number, driverLong: number, pickupLat: number, pickupLong: number) => {
      // OSRM coordinates: {lon},{lat};{lon},{lat} with overview=full so route geometry is returned
      const lonLatUrl = `https://pikmecontainerapp.politemushroom-8a010def.southindia.azurecontainerapps.io/route/v1/driving/${driverLong},${driverLat};${pickupLong},${pickupLat}?overview=full&geometries=geojson`;
      const latLonUrl = `https://pikmecontainerapp.politemushroom-8a010def.southindia.azurecontainerapps.io/route/v1/driving/${driverLat},${driverLong};${pickupLat},${pickupLong}?overview=full&geometries=geojson`;

      let extractedCoords: Array<{ latitude: number; longitude: number }> = [];
      let distance: number | undefined;
      let duration: number | undefined;

      try {
        console.log('[Route API Request]', lonLatUrl);
        const res = await axios.get(lonLatUrl);
        console.log('[Route API Response]', res.data);

        const routeData = res.data?.routes?.[0];
        if (routeData) {
          distance = routeData.distance ?? routeData.legs?.[0]?.distance;
          duration = routeData.duration ?? routeData.legs?.[0]?.duration;
          if (routeData?.geometry?.coordinates && Array.isArray(routeData.geometry.coordinates)) {
            extractedCoords = routeData.geometry.coordinates.map((pt: [number, number]) => ({
              latitude: pt[1],
              longitude: pt[0],
            }));
          }
        }
      } catch (err: any) {
        console.log('[Route API Error]', err?.response?.data || err?.message || err);
        try {
          console.log('[Route API Request (fallback)]', latLonUrl);
          const fallbackRes = await axios.get(latLonUrl);
          console.log('[Route API Response (fallback)]', fallbackRes.data);

          const routeData = fallbackRes.data?.routes?.[0];
          if (routeData) {
            distance = routeData.distance ?? routeData.legs?.[0]?.distance;
            duration = routeData.duration ?? routeData.legs?.[0]?.duration;
            if (routeData?.geometry?.coordinates && Array.isArray(routeData.geometry.coordinates)) {
              extractedCoords = routeData.geometry.coordinates.map((pt: [number, number]) => ({
                latitude: pt[1],
                longitude: pt[0],
              }));
            }
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

      // If distance or duration is 0 or undefined, calculate from coordinates
      if ((distance === undefined || distance === 0) && driverLat && pickupLat) {
        const haversineDist = calculateHaversineMeters(driverLat, driverLong, pickupLat, pickupLong);
        if (haversineDist > 20) {
          distance = haversineDist;
          duration = duration && duration > 0 ? duration : Math.round(haversineDist / 7); // ~25 km/h driving speed
        }
      }

      if (distance !== undefined || duration !== undefined) {
        setRouteInfo({
          distance: distance ?? 0,
          duration: duration ?? 0,
        });
      }
    },
    []
  );

  const fitMapToPoints = useCallback(
    (driverLoc: DriverLocation, cardVisible = isCardVisible) => {
      if (!mapRef.current) return;

      const bottomPadding = cardVisible ? 280 : 80;

      if (passengerCoords) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: driverLoc.latitude, longitude: driverLoc.longitude },
            { latitude: passengerCoords.latitude, longitude: passengerCoords.longitude },
          ],
          {
            edgePadding: { top: 80, right: 80, bottom: bottomPadding, left: 80 },
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
    [passengerCoords, isCardVisible]
  );

  const handleToggleCard = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCardVisible((prev) => {
      const next = !prev;
      if (locationRef.current) {
        fitMapToPoints(locationRef.current, next);
      }
      return next;
    });
  }, [fitMapToPoints]);

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

          {/* Floating ETA & Distance Pill on Map */}
          {routeInfo && (
            <View style={styles.floatingEtaPill}>
              <Text style={styles.floatingEtaText}>
                ⏱️ {formatDuration(routeInfo.duration)}  •  🚗 {formatDistance(routeInfo.distance)}
              </Text>
            </View>
          )}

          {/* Floating Icon to Hide/Show Details Screen */}
          <TouchableOpacity
            style={styles.floatingToggleFab}
            onPress={handleToggleCard}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>{isCardVisible ? '⌄' : '🚗'}</Text>
          </TouchableOpacity>

          {/* Floating Bottom Pill when details card is hidden */}
          {!isCardVisible && (
            <TouchableOpacity
              style={[styles.floatingBottomPill, { bottom: (insets.bottom || 0) + 20 }]}
              onPress={handleToggleCard}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18 }}>🚗</Text>
              <Text style={styles.floatingBottomPillText}>Show Details</Text>
              {routeInfo ? (
                <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                  • {formatDuration(routeInfo.duration)} ({formatDistance(routeInfo.distance)})
                </Text>
              ) : null}
            </TouchableOpacity>
          )}

          {isCardVisible && (
            <View style={[styles.locationCard, { marginBottom: (insets.bottom || 0) + 12 }]}>
              {/* Centered visible hide handle/button */}
              <TouchableOpacity
                style={styles.centerHideButton}
                onPress={handleToggleCard}
                activeOpacity={0.7}
              >
                <View style={styles.centerDragBar} />
                <View style={styles.centerHidePill}>
                  <Text style={styles.centerHideIcon}>⌄</Text>
                  <Text style={styles.centerHideText}>Hide</Text>
                </View>
              </TouchableOpacity>

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

                  <TouchableOpacity
                    style={styles.cardHeaderToggle}
                    onPress={handleToggleCard}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cardHeaderToggleText}>⌄ Hide</Text>
                  </TouchableOpacity>
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

            {/* Distance and Time to Reach Location */}
            {routeInfo && (
              <View style={styles.etaContainer}>
                <View style={styles.etaItem}>
                  <Text style={styles.etaLabel}>Distance to Location</Text>
                  <Text style={styles.etaValue}>🚗 {formatDistance(routeInfo.distance)}</Text>
                </View>
                <View style={styles.etaDivider} />
                <View style={styles.etaItem}>
                  <Text style={styles.etaLabel}>Time to Reach</Text>
                  <Text style={styles.etaValue}>⏱️ {formatDuration(routeInfo.duration)}</Text>
                </View>
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
                  {'Open in Maps'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          )}
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
