import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import ScreenHeader from '../../../components/common/ScreenHeader';
import { EligibleDriver, reservationError, reservationService } from '../../../services/api/reservationService';

/**
 * Drivers who can take the reservation: approved, a fitting vehicle, near the pickup (nearest by driving
 * time first), with how many reservations they cancelled this month. Tap one to assign.
 */
export default function AssignReservationDriverScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const reservationId: string = route.params?.reservationId;
  const hasDriver: boolean = !!route.params?.hasDriver;
  const [drivers, setDrivers] = useState<EligibleDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setDrivers(await reservationService.getEligibleDrivers(reservationId));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async (d: EligibleDriver) => {
    setBusyId(d.driverId);
    try {
      await reservationService.assign(reservationId, d.driverId);
      Alert.alert('Driver assigned', `${d.name || d.driverId} now holds this reservation. The driver and the passenger have been told.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Couldn’t assign', reservationError(e) ?? 'Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const confirm = (d: EligibleDriver) =>
    Alert.alert(
      hasDriver ? 'Reassign to this driver?' : 'Assign this driver?',
      `${d.name || d.driverId}${d.vehicleNumber ? ` · ${d.vehicleNumber}` : ''}${hasDriver ? '\n\nThe current driver loses it and is told. This isn’t counted against them.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: hasDriver ? 'Reassign' : 'Assign', onPress: () => assign(d) },
      ],
    );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={hasDriver ? 'Reassign driver' : 'Assign a driver'} subtitle="Nearby, approved, right vehicle" onBack={() => navigation.goBack()} onRefresh={load} refreshing={loading} />
      {loading && drivers.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={d => d.driverId}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 30 }}>
              {failed ? 'Couldn’t load drivers. Tap refresh to try again.' : 'No online drivers with a fitting vehicle near the pickup right now.'}
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              disabled={!!busyId}
              onPress={() => confirm(item)}
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.cardShadow, opacity: busyId && busyId !== item.driverId ? 0.5 : 1 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '700' }}>{item.name || item.driverId}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 3 }}>
                  {[item.vehicleCategory, item.vehicleNumber].filter(Boolean).join(' · ') || '--'}
                </Text>
                <Text style={{ color: item.cancelsThisMonth ? colors.danger : colors.textSecondary, fontSize: 12, marginTop: 3 }}>
                  {item.cancelsThisMonth ? `${item.cancelsThisMonth} reservation cancel${item.cancelsThisMonth > 1 ? 's' : ''} this month` : 'No cancels this month'}
                </Text>
              </View>
              {busyId === item.driverId ? <ActivityIndicator color={colors.primary} /> : <Text style={{ color: colors.textPrimary, fontSize: 18 }}>›</Text>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 16, marginBottom: 10,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
});
