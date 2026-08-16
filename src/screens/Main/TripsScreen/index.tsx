import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Keyboard, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import {
  Trip,
  fetchRecentTrips,
  fetchTripsByDriver,
  fetchTripsByPassenger,
} from '../../../services/api/tripsApi';

type TabOption = 'recent' | 'driver' | 'passenger';

const STATUS_FILTERS: { label: string, value: string }[] = [
  { label: 'All Trips', value: 'all' },
  { label: 'Completed', value: 'PaymentComplete' },
  { label: 'Started', value: 'RideStarted' },
  { label: 'Accepted', value: 'DriverAccepted' },
  { label: 'Cancelled (Driver)', value: 'CancelledByDriver' },
  { label: 'Cancelled (Passenger)', value: 'CancelledByPassenger' },
  { label: 'Rejected', value: 'Rejected' },
];

export default function TripsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState<TabOption>('recent');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchPhone, setSearchPhone] = useState('');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  const loadTripsData = async (queryToSearch?: string) => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      let data: Trip[] = [];
      if (activeTab === 'recent') {
        data = await fetchRecentTrips();
      } else {
        const query = (queryToSearch !== undefined ? queryToSearch : searchPhone).trim();
        if (query.length === 10) {
          if (activeTab === 'driver') {
            data = await fetchTripsByDriver(query);
          } else if (activeTab === 'passenger') {
            data = await fetchTripsByPassenger(query);
          }
        }
      }
      setTrips(data);
      setStats({ total: data.length });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'recent') {
      loadTripsData();
    } else {
      const query = searchPhone.trim();
      if (query.length === 10) {
        const timer = setTimeout(() => {
          loadTripsData(query);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setTrips([]);
        setStats({ total: 0 });
      }
    }
  }, [activeTab, searchPhone]);

  const filteredTrips = trips.filter(trip =>
    activeStatus === 'all' || trip.tripStatus === activeStatus
  );

  const formatStatusDisplay = (status?: string) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ');
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetails', { tripData: item })}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{formatStatusDisplay(item.tripStatus)}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <Text>🔵</Text>
        <Text style={styles.locText} numberOfLines={1}>{item.fromLocation}</Text>
      </View>
      <View style={{ marginLeft: 22 }}>
        <Text style={{ color: colors.border, marginTop: -6, marginBottom: -6 }}>|</Text>
      </View>
      <View style={styles.routeContainer}>
        <Text>🔴</Text>
        <Text style={styles.locText} numberOfLines={1}>{item.toLocation}</Text>
      </View>

      <View style={styles.cardFooterRow}>
        <Text style={styles.dateText}>{new Date(item.createdOn || item.tripStartDate || Date.now()).toLocaleString()}</Text>
        <Text style={styles.fareText}>₹{(item.finalFareAmount || 0).toFixed(2)}</Text>
      </View>

      {item.tripStatus === 'PaymentComplete' && (
        <TouchableOpacity
          style={styles.routeInfoButton}
          onPress={() => {
            const fromLat = item.fromAddress?.latitude;
            const fromLng = item.fromAddress?.longitude;
            const toLat = item.toAddress?.latitude;
            const toLng = item.toAddress?.longitude;
            const origin = (fromLat && fromLng) ? `${fromLat},${fromLng}` : encodeURIComponent(item.fromLocation || '');
            const dest = (toLat && toLng) ? `${toLat},${toLng}` : encodeURIComponent(item.toLocation || '');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
            Linking.openURL(url);
          }}
        >
          <Text style={styles.routeInfoButtonText}>🗺️  Route Info</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips Monitor</Text>
        <Text style={styles.statsSubtitle}>Total Trips: {stats.total}</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'recent' && styles.tabButtonActive]}
          onPress={() => setActiveTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.tabTextActive]}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'driver' && styles.tabButtonActive]}
          onPress={() => setActiveTab('driver')}
        >
          <Text style={[styles.tabText, activeTab === 'driver' && styles.tabTextActive]}>By Driver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'passenger' && styles.tabButtonActive]}
          onPress={() => setActiveTab('passenger')}
        >
          <Text style={[styles.tabText, activeTab === 'passenger' && styles.tabTextActive]}>By Passenger</Text>
        </TouchableOpacity>
      </View>

      {(activeTab === 'driver' || activeTab === 'passenger') && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Enter ${activeTab === 'driver' ? 'Driver' : 'Passenger'} Phone`}
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={searchPhone}
            onChangeText={setSearchPhone}
          />
          <TouchableOpacity style={styles.searchButton} onPress={loadTripsData}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          contentContainerStyle={styles.filterScroll}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterPill, activeStatus === item.value && styles.filterPillActive]}
              onPress={() => setActiveStatus(item.value)}
            >
              <Text style={[styles.filterText, activeStatus === item.value && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          renderItem={renderTripCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>📭</Text>
              <Text style={styles.emptyStateText}>No trips found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
