import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { 
  Trip, 
  TripStatus, 
  fetchRecentTrips, 
  fetchTripsByDriver, 
  fetchTripsByPassenger,
  fetchTripStatsToday 
} from '../../../services/api/tripsApi';

type TabOption = 'recent' | 'driver' | 'passenger';

const STATUS_FILTERS: { label: string, value: TripStatus | 'all' }[] = [
  { label: 'All Trips', value: 'all' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Started', value: 'ride_started' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled (Passenger)', value: 'cancelled_passenger' },
  { label: 'Cancelled (Driver)', value: 'cancelled_driver' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Skipped', value: 'skipped' },
];

export default function TripsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [activeTab, setActiveTab] = useState<TabOption>('recent');
  const [activeStatus, setActiveStatus] = useState<TripStatus | 'all'>('all');
  const [searchPhone, setSearchPhone] = useState('');
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    loadStats();
    if (activeTab === 'recent') {
      loadTripsData();
    } else {
      setTrips([]); 
    }
  }, [activeTab]);

  const loadStats = async () => {
    const data = await fetchTripStatsToday();
    setStats(data);
  };

  const loadTripsData = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      let data: Trip[] = [];
      if (activeTab === 'recent') {
        data = await fetchRecentTrips();
      } else if (activeTab === 'driver') {
        data = await fetchTripsByDriver(searchPhone);
      } else if (activeTab === 'passenger') {
        data = await fetchTripsByPassenger(searchPhone);
      }
      setTrips(data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => 
    activeStatus === 'all' || trip.status === activeStatus
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
        <Text style={styles.tripId}>{item.id || item.tripId || 'Unknown ID'}</Text>
        <View style={styles.statusBadge}>
           <Text style={styles.statusText}>{formatStatusDisplay(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.routeContainer}>
        <Text>🔵</Text>
        <Text style={styles.locText} numberOfLines={1}>{item.pickup}</Text>
      </View>
      <View style={{ marginLeft: 22 }}>
        <Text style={{ color: colors.border, marginTop: -6, marginBottom: -6 }}>|</Text>
      </View>
      <View style={styles.routeContainer}>
        <Text>🔴</Text>
        <Text style={styles.locText} numberOfLines={1}>{item.dropoff}</Text>
      </View>

      <View style={styles.cardFooterRow}>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleString()}</Text>
        <Text style={styles.fareText}>{item.fare}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trips Monitor</Text>
        <Text style={styles.statsSubtitle}>Today's Total Trips: {stats.total}</Text>
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
