import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { reportsService, TopOnlineDriver } from '../../../services/api/reportsService';
import ScreenHeader from '../../../components/common/ScreenHeader';
import DriverPhoneMenu from '../../../components/common/DriverPhoneMenu';

export default function TopOnlineDriversScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [drivers, setDrivers] = useState<TopOnlineDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('All');
  const period = new Date().toISOString().substring(0, 7);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDrivers(await reportsService.getTopOnlineDrivers(period));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const cities = useMemo(() => ['All', ...Array.from(new Set(drivers.map((d) => d.city).filter(Boolean) as string[]))], [drivers]);
  const list = drivers.filter((d) => city === 'All' || d.city === city);

  const rankStyle = (rank: number) =>
    rank === 1 ? { bg: '#F5B30133', fg: '#B88700' } : rank === 2 ? { bg: '#C0C0C033', fg: '#8A8A8A' } : rank === 3 ? { bg: '#CD7F3233', fg: '#CD7F32' } : { bg: colors.tabActiveBg, fg: colors.textPrimary };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Top Online Drivers" subtitle={`Ranked by online hours · ${period}`} onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />

      {cities.length > 2 && (
        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={cities}
            keyExtractor={(c) => c}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
            renderItem={({ item }) => {
              const active = item === city;
              return (
                <TouchableOpacity
                  onPress={() => setCity(item)}
                  style={[styles.pill, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.primaryText : colors.textSecondary }}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(d, i) => d.partitionKey || d.mobileNumber || String(i)}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[colors.primary]} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 40 }}>No top online drivers data found for this period.</Text>}
          renderItem={({ item, index }) => {
            const rank = item.rank || index + 1;
            const name = item.driverName || item.name || item.partitionKey || `Driver #${rank}`;
            const phone = item.mobileNumber || item.phone || '';
            const hours = item.totalOnlineHours ?? 0;
            const rs = rankStyle(rank);
            return (
              <View style={[styles.row, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
                <View style={[styles.rank, { backgroundColor: rs.bg }]}>
                  <Text style={{ color: rs.fg, fontWeight: '800', fontSize: 13 }}>{rank}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>{name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    {phone ? <DriverPhoneMenu pill phone={phone} driverName={name} textStyle={{ fontSize: 12 }} /> : null}
                    {item.city ? <Text style={{ fontSize: 12, color: colors.textSecondary }}>📍 {item.city}</Text> : null}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '800' }}>
                    {typeof hours === 'number' ? hours.toFixed(1) : hours} h
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>online</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18, marginBottom: 10, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  rank: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
