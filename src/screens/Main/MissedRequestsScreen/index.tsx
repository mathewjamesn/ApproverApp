import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { reportsService, MissedRequest } from '../../../services/api/reportsService';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { TRIP_KIND_META, formatTimeDisplay, getTripKind } from '../../../utils/tripHelpers';

const DAY_OPTIONS = [1, 2, 5, 10];

export default function MissedRequestsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [days, setDays] = useState(1);
  const [items, setItems] = useState<MissedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setUnavailable(false);
    try {
      setItems(await reportsService.getMissedRequests(days));
    } catch {
      setItems([]);
      setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const byReason = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((m) => {
      const r = m.reason || 'No driver accepted';
      map[r] = (map[r] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const palette = [colors.danger, '#F59E0B', colors.info, colors.textSecondary];

  const Header = (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {DAY_OPTIONS.map((d) => {
          const active = d === days;
          return (
            <TouchableOpacity
              key={d}
              onPress={() => setDays(d)}
              style={[styles.pill, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.primaryText : colors.textSecondary }}>
                {d === 1 ? 'Today' : `${d} days`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Missed requests</Text>
        <Text style={{ color: colors.textPrimary, fontSize: 38, fontWeight: '800', marginVertical: 4 }}>{items.length}</Text>
        {items.length > 0 && (
          <>
            <View style={[styles.bar, { backgroundColor: colors.border }]}>
              {byReason.map(([r, c], i) => (
                <View key={r} style={{ flex: c, backgroundColor: palette[i % palette.length] }} />
              ))}
            </View>
            {byReason.map(([r, c], i) => (
              <View key={r} style={styles.reasonRow}>
                <View style={[styles.dot, { backgroundColor: palette[i % palette.length] }]} />
                <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 13 }}>{r}</Text>
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{c}</Text>
              </View>
            ))}
          </>
        )}
      </View>
      {items.length > 0 && <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 16, marginTop: 22, marginBottom: 10 }}>Recent missed requests</Text>}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Missed Requests" subtitle="Ride requests no driver accepted" onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />
      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(m, i) => m.id || String(i)}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} colors={[colors.primary]} tintColor={colors.primary} />}
          ListHeaderComponent={Header}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 30, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 38 }}>{unavailable ? '🔌' : '🎉'}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 10, textAlign: 'center' }}>
                {unavailable
                  ? 'The missed requests service is not connected yet. Once the backend route is confirmed it will list here.'
                  : 'No missed requests in this period.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const kind = getTripKind(item);
            const meta = TRIP_KIND_META[kind];
            return (
              <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow, marginBottom: 12 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.badge, { backgroundColor: colors.danger + '1F' }]}>
                    <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>{item.reason || 'No driver accepted'}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: meta.color + '1F' }]}>
                    <Text style={{ color: meta.color, fontSize: 12, fontWeight: '700' }}>{meta.icon} {kind}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 12 }} numberOfLines={1}>🔵  {item.fromLocation || '--'}</Text>
                <Text style={{ color: colors.textPrimary, fontSize: 13, marginTop: 6 }} numberOfLines={1}>🔴  {item.toLocation || '--'}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 10 }}>
                  {formatTimeDisplay(item.requestedOn || item.createdOn)}
                  {item.passengerName ? `  ·  ${item.passengerName}` : ''}
                  {item.vehicleCategory ? `  ·  ${item.vehicleCategory}` : ''}
                  {item.driversNotified !== undefined ? `  ·  ${item.driversNotified} notified` : ''}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  card: { borderRadius: 20, padding: 16, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  bar: { flexDirection: 'row', height: 10, borderRadius: 99, overflow: 'hidden', marginVertical: 12, gap: 2 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
});
