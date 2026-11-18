import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { reportsService } from '../../../services/api/reportsService';
import ScreenHeader from '../../../components/common/ScreenHeader';

export const CITIES_LIST = [
  'Ernakulam', 'Palakkad', 'Trivandrum', 'Kollam', 'Kottayam', 'Thrissur', 'Calicut',
  'Kannur', 'Idukki', 'Pathanamthitta', 'Alappuzha', 'Wayanad', 'Kasargod', 'Malappuram',
];

interface CityRow {
  city: string;
  cars: number | null;
  autos: number | null;
}

export default function OnlineDriversByCityScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [rows, setRows] = useState<CityRow[]>(CITIES_LIST.map((city) => ({ city, cars: null, autos: null })));
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    // Each city fills in as its two requests return
    await Promise.all(
      CITIES_LIST.map(async (city) => {
        const [cars, autos] = await Promise.all([
          reportsService.getDriversCountByAvailabilityStatus(city, 'Car', 'online'),
          reportsService.getDriversCountByAvailabilityStatus(city, 'Auto', 'online'),
        ]);
        setRows((prev) => prev.map((r) => (r.city === city ? { city, cars, autos } : r)));
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loaded = rows.filter((r) => r.cars !== null);
  const totalCars = loaded.reduce((a, r) => a + (r.cars || 0), 0);
  const totalAutos = loaded.reduce((a, r) => a + (r.autos || 0), 0);
  const max = Math.max(1, ...loaded.map((r) => (r.cars || 0) + (r.autos || 0)));
  const sorted = [...rows].sort((a, b) => ((b.cars || 0) + (b.autos || 0)) - ((a.cars || 0) + (a.autos || 0)));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Online Drivers by City" subtitle="Cars and autos online right now" onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Online now · {loaded.length}/{CITIES_LIST.length} cities loaded</Text>
          <Text style={[styles.big, { color: colors.textPrimary }]}>{totalCars + totalAutos}</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><Text style={{ color: colors.textSecondary, fontSize: 12 }}>🚗 Cars {totalCars}</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#F97316' }]} /><Text style={{ color: colors.textSecondary, fontSize: 12 }}>🛺 Autos {totalAutos}</Text></View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow, marginTop: 14, paddingVertical: 6 }]}>
          {sorted.map((r, i) => {
            const cars = r.cars ?? 0;
            const autos = r.autos ?? 0;
            const total = cars + autos;
            return (
              <View key={r.city} style={[styles.cityRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={styles.cityTop}>
                  <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 14 }}>{r.city}</Text>
                  {r.cars === null ? (
                    <ActivityIndicator size="small" color={colors.textSecondary} />
                  ) : (
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      🚗 {cars}  ·  🛺 {autos}  ·  <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{total}</Text>
                    </Text>
                  )}
                </View>
                <View style={[styles.track, { backgroundColor: colors.tabActiveBg, width: `${Math.max(4, (total / max) * 100)}%` }]}>
                  <View style={{ flex: Math.max(cars, 0.0001), backgroundColor: colors.primary }} />
                  <View style={{ flex: Math.max(autos, 0.0001), backgroundColor: '#F97316' }} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  big: { fontSize: 40, fontWeight: '800', marginVertical: 4 },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  cityRow: { paddingVertical: 12 },
  cityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  track: { height: 8, borderRadius: 99, overflow: 'hidden', flexDirection: 'row' },
});
