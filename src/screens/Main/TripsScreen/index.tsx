import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Keyboard, StatusBar, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import {
  Trip,
  fetchRecentTrips,
  fetchTripsByDriver,
  fetchTripsByPassenger,
} from '../../../services/api/tripsApi';
import TripCard from '../../../components/common/TripCard';
import { getEffectiveTripStatus, getTripKind, TripKind } from '../../../utils/tripHelpers';

type TabOption = 'recent' | 'driver' | 'passenger';

const STATUS_FILTERS: { label: string, value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Accepted', value: 'DriverAccepted' },
  { label: 'Completed', value: 'PaymentComplete' },
  { label: 'Started', value: 'RideStarted' },
  { label: 'Cancelled (Driver)', value: 'CancelledByDriver' },
  { label: 'Cancelled (Passenger)', value: 'CancelledByPassenger' },
  { label: 'Rejected', value: 'Rejected' },
];

const TYPE_FILTERS: { label: string, value: 'all' | TripKind }[] = [
  { label: 'All types', value: 'all' },
  { label: '🚕 Normal', value: 'Normal' },
  { label: '⏱️ Rental', value: 'Rental' },
  { label: '📅 Reservation', value: 'Reservation' },
];

export default function TripsScreen({ route }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState<TabOption>('recent');
  const [activeStatus, setActiveStatus] = useState<string>(route?.params?.initialStatus || 'all');
  const [activeType, setActiveType] = useState<'all' | TripKind>('all');
  const [searchPhone, setSearchPhone] = useState('');

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Allow other screens (e.g. Home tiles) to open Trips with a status preselected
  useEffect(() => {
    if (route?.params?.initialStatus) {
      setActiveStatus(route.params.initialStatus);
    }
  }, [route?.params?.initialStatus]);

  const loadTripsData = async (queryToSearch?: string, isRefreshCall?: boolean) => {
    Keyboard.dismiss();
    if (!isRefreshCall) {
      setIsLoading(true);
    }
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
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTripsData(undefined, true);
    } finally {
      setRefreshing(false);
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
      }
    }
  }, [activeTab, searchPhone]);

  const filteredTrips = trips.filter(trip => {
    const effectiveStatus = getEffectiveTripStatus(trip);
    if (activeType !== 'all' && getTripKind(trip) !== activeType) return false;
    if (activeStatus === 'all') return true;
    if (activeStatus === 'DriverAccepted' || activeStatus === 'Accepted') {
      return (
        effectiveStatus === 'DriverAccepted' ||
        effectiveStatus === 'accepted' ||
        effectiveStatus === 'Accepted'
      );
    }
    if (activeStatus === 'PaymentComplete' || activeStatus === 'completed') {
      return effectiveStatus === 'PaymentComplete' || effectiveStatus === 'completed';
    }
    return effectiveStatus === activeStatus;
  });

  const renderPills = (
    data: { label: string; value: string }[],
    active: string,
    onSelect: (v: any) => void,
  ) => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      contentContainerStyle={styles.filterScroll}
      keyExtractor={(item) => item.value}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.filterPill, active === item.value && styles.filterPillActive]}
          onPress={() => onSelect(item.value)}
        >
          <Text style={[styles.filterText, active === item.value && styles.filterTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 16 }]}>
        <Text style={styles.headerTitle}>Trips</Text>
        <Text style={styles.statsSubtitle}>
          {filteredTrips.length} trip{filteredTrips.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {(['recent', 'driver', 'passenger'] as TabOption[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'recent' ? 'Recent' : tab === 'driver' ? 'By Driver' : 'By Passenger'}
            </Text>
          </TouchableOpacity>
        ))}
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
          <TouchableOpacity style={styles.searchButton} onPress={() => loadTripsData()}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      <View>
        {renderPills(TYPE_FILTERS, activeType, setActiveType)}
        <View style={{ marginTop: -8 }}>{renderPills(STATUS_FILTERS, activeStatus, setActiveStatus)}</View>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={({ item }) => <TripCard trip={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
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
