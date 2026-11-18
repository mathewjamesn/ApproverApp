import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { reportsService } from '../../../services/api/reportsService';
import { driverService } from '../../../services/api/driverService';

const REFRESH_MS = 15000;
const MAX_DRIVERS = 30;

type Category = 'Mini' | 'Sedan' | 'SUV' | 'Auto' | 'Other';
const CATEGORY_COLORS: Record<Category, string> = {
  Mini: '#10B981',
  Sedan: '#3B82F6',
  SUV: '#F59E0B',
  Auto: '#F97316',
  Other: '#64748B',
};

interface MapDriver {
  key: string;
  name: string;
  phone: string;
  category: Category;
  vehicle?: string;
  latitude: number;
  longitude: number;
  status?: string;
}

const toCategory = (raw?: string): Category => {
  const s = (raw || '').toLowerCase();
  if (s.includes('mini') || s.includes('hatch')) return 'Mini';
  if (s.includes('sedan')) return 'Sedan';
  if (s.includes('suv') || s.includes('muv')) return 'SUV';
  if (s.includes('auto')) return 'Auto';
  return 'Other';
};

/**
 * Live map of online drivers. There is no "all online drivers with coordinates" endpoint in the app yet,
 * so this plots the Top Online Drivers list using each driver's live location. Swap `loadDrivers`
 * for a dedicated endpoint when one exists.
 */
export default function LiveMapScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const fitted = useRef(false);

  const [drivers, setDrivers] = useState<MapDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | Category>('All');
  const [selected, setSelected] = useState<MapDriver | null>(null);

  const loadDrivers = useCallback(async () => {
    try {
      const period = new Date().toISOString().substring(0, 7);
      const top = (await reportsService.getTopOnlineDrivers(period)).slice(0, MAX_DRIVERS);
      const located = await Promise.all(
        top.map(async (d, i): Promise<MapDriver | null> => {
          const phone = d.mobileNumber || d.phone || '';
          if (!phone) return null;
          try {
            const loc = await driverService.getDriverLocationDetails(phone);
            if (!loc) return null;
            if ((loc.status || '').toLowerCase() === 'offline') return null;
            return {
              key: d.partitionKey || phone || String(i),
              name: d.driverName || d.name || phone,
              phone,
              category: toCategory(d.vehicleCategory || d.vehicleType || d.category),
              vehicle: d.vehicleModel || d.vehicleType,
              latitude: loc.latitude,
              longitude: loc.longitude,
              status: loc.status,
            };
          } catch {
            return null;
          }
        }),
      );
      const list = located.filter(Boolean) as MapDriver[];
      setDrivers(list);
      if (!fitted.current && list.length > 0) {
        fitted.current = true;
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(list.map((d) => ({ latitude: d.latitude, longitude: d.longitude })), {
            edgePadding: { top: 160, right: 60, bottom: 160, left: 60 },
            animated: true,
          });
        }, 400);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
    const t = setInterval(loadDrivers, REFRESH_MS);
    return () => clearInterval(t);
  }, [loadDrivers]);

  const visible = useMemo(() => drivers.filter((d) => filter === 'All' || d.category === filter), [drivers, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: drivers.length };
    drivers.forEach((d) => (c[d.category] = (c[d.category] || 0) + 1));
    return c;
  }, [drivers]);

  const filters: ('All' | Category)[] = ['All', ...(['Mini', 'Sedan', 'SUV', 'Auto', 'Other'] as Category[]).filter((c) => counts[c])];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: 10.0, longitude: 76.3, latitudeDelta: 3, longitudeDelta: 3 }}
        onPress={() => setSelected(null)}
      >
        {visible.map((d) => (
          <Marker
            key={d.key}
            coordinate={{ latitude: d.latitude, longitude: d.longitude }}
            onPress={() => setSelected(d)}
            tracksViewChanges={false}
          >
            <View
              style={[
                styles.carMarker,
                {
                  borderColor: CATEGORY_COLORS[d.category],
                  backgroundColor: selected?.key === d.key ? CATEGORY_COLORS[d.category] : colors.card,
                  transform: [{ scale: selected?.key === d.key ? 1.2 : 1 }],
                },
              ]}
            >
              <Text style={{ fontSize: 18 }}>{d.category === 'Auto' ? '🛺' : '🚗'}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top panel */}
      <View style={[styles.top, { paddingTop: (insets.top || 0) + 8 }]} pointerEvents="box-none">
        <View style={[styles.panel, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 18, color: colors.textPrimary }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>Live drivers</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              {loading ? 'Loading…' : `${visible.length} online · refreshes every ${REFRESH_MS / 1000}s`}
            </Text>
          </View>
          <TouchableOpacity onPress={loadDrivers} style={[styles.back, { backgroundColor: colors.tabActiveBg }]}>
            {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={{ fontSize: 15 }}>🔄</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {filters.map((f) => {
            const active = f === filter;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  setFilter(f);
                  setSelected(null);
                }}
                style={[styles.chip, { backgroundColor: active ? colors.primary : colors.card, shadowColor: colors.cardShadow }]}
              >
                {f !== 'All' && <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[f] }]} />}
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? colors.primaryText : colors.textPrimary }}>
                  {f} {counts[f] ?? 0}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!loading && drivers.length === 0 && (
        <View style={[styles.empty, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            No online drivers with a live location were found right now.
          </Text>
        </View>
      )}

      {/* Selected driver card */}
      {selected && (
        <View style={[styles.sheet, { backgroundColor: colors.card, shadowColor: colors.cardShadow, bottom: (insets.bottom || 0) + 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[styles.avatar, { backgroundColor: CATEGORY_COLORS[selected.category] + '26' }]}>
              <Text style={{ fontSize: 22 }}>{selected.category === 'Auto' ? '🛺' : '🚗'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>{selected.name}</Text>
              <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[selected.category] + '26' }]}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[selected.category] }]} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{selected.category}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.close}>
              <Text style={{ color: colors.textSecondary }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 14, gap: 8 }}>
            <View style={styles.kv}><Text style={{ color: colors.textSecondary }}>Mobile</Text><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{selected.phone}</Text></View>
            <View style={styles.kv}><Text style={{ color: colors.textSecondary }}>Vehicle category</Text><Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{selected.vehicle ? `${selected.vehicle} · ` : ''}{selected.category}</Text></View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.tabActiveBg }]}
              onPress={() => Linking.openURL(`tel:${selected.phone.replace(/[^\d+]/g, '')}`).catch(() => {})}
            >
              <Text style={{ color: colors.accent, fontWeight: '700' }}>📞  Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() =>
                navigation.navigate('DriverTrips', {
                  phone: selected.phone.replace(/\D/g, '').slice(-10),
                  driverName: selected.name,
                  initialStatus: 'all',
                })
              }
            >
              <Text style={{ color: colors.primaryText, fontWeight: '700' }}>View trips</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 12, right: 12 },
  panel: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 20, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 8 },
  back: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  carMarker: { width: 40, height: 40, borderRadius: 20, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
  empty: { position: 'absolute', left: 24, right: 24, top: '45%', padding: 16, borderRadius: 16 },
  sheet: { position: 'absolute', left: 12, right: 12, borderRadius: 24, padding: 16, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  close: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  kv: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
});
