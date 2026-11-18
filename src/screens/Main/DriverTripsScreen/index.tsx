import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { fetchTripsByDriver } from '../../../services/api/tripsApi';
import TripCard from '../../../components/common/TripCard';
import { getEffectiveTripStatus } from '../../../utils/tripHelpers';

const FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'PaymentComplete' },
  { label: 'Cancelled (Driver)', value: 'CancelledByDriver' },
  { label: 'Cancelled (Passenger)', value: 'CancelledByPassenger' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Accepted', value: 'DriverAccepted' },
  { label: 'Started', value: 'RideStarted' },
];

/**
 * "Find other trips by this driver" destination: every trip for one driver with status counts
 * and filters (completed, cancelled, rejected...).
 */
export default function DriverTripsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const phone: string = route.params?.phone || '';
  const driverName: string = route.params?.driverName || 'Driver';
  const [activeStatus, setActiveStatus] = useState<string>(route.params?.initialStatus || 'all');
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh?: boolean) => {
      if (!isRefresh) setIsLoading(true);
      try {
        setTrips(await fetchTripsByDriver(phone));
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [phone],
  );

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { total: trips.length, completed: 0, cancelled: 0 };
    trips.forEach((t) => {
      const s = getEffectiveTripStatus(t).toLowerCase();
      if (s.includes('complete')) c.completed += 1;
      else if (s.includes('cancel')) c.cancelled += 1;
    });
    return c;
  }, [trips]);

  const filtered = trips.filter((t) => {
    if (activeStatus === 'all') return true;
    const s = getEffectiveTripStatus(t);
    if (activeStatus === 'DriverAccepted') return s.toLowerCase().includes('accept');
    return s === activeStatus;
  });

  const SummaryTile = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <View style={[styles.tile, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
      <Text style={[styles.tileValue, { color }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: (insets.top || 0) + 14 }]}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primaryText, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={1}>{driverName}</Text>
          <Text style={{ color: colors.primaryText, opacity: 0.8, fontSize: 12 }}>{phone} · Trips by this driver</Text>
        </View>
      </View>

      <View style={styles.tiles}>
        <SummaryTile value={counts.total} label="Total" color={colors.textPrimary} />
        <SummaryTile value={counts.completed} label="Completed" color={colors.success} />
        <SummaryTile value={counts.cancelled} label="Cancelled" color={colors.danger} />
      </View>

      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(i) => i.value}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
          renderItem={({ item }) => {
            const active = activeStatus === item.value;
            return (
              <TouchableOpacity
                onPress={() => setActiveStatus(item.value)}
                style={[
                  styles.pill,
                  { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.primaryText : colors.textSecondary }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.id || String(i)}
          renderItem={({ item }) => <TripCard trip={item} hideDriver highlight={item.id === route.params?.fromTripId} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(true);
              }}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 50 }}>
              <Text style={{ fontSize: 38 }}>📭</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No trips for this filter</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 38 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '700' },
  tiles: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: -24 },
  tile: { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: 'center', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  tileValue: { fontSize: 22, fontWeight: '800' },
  tileLabel: { fontSize: 11, marginTop: 2 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
});
