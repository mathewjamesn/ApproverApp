import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from '../nav';
import { AppText } from '../ui/AppText';
import { Card, ListCard } from '../ui/Parts';
import { Icon } from '../ui/Icon';
import { Chips, Pill, Row, type Tone } from '../ui/Bits';
import { TabScreen } from '../ui/Chrome';
import { colors } from '../theme';
import { inr, shortStatus, STATUS_COUNTS, TRIPS, type TripStatus } from '../state/data';

export const STATUS_TONE: Record<TripStatus, Tone> = {
  Completed: 'good',
  Started: 'info',
  Accepted: 'info',
  'Cancelled (driver)': 'bad',
  'Cancelled (passenger)': 'warn',
  Rejected: 'mute',
};

type Filter = 'All' | TripStatus;

/** Latest trips with search (trip id, names, phone numbers, places) and a status filter. */
export default function Trips() {
  const [filter, setFilter] = useState<Filter>('All');
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const list = TRIPS.filter(t => (filter === 'All' || t.status === filter) && (!query || [t.id, t.driver, t.dphone, t.pax, t.pphone, t.from, t.to].join(' ').toLowerCase().includes(query)));

  return (
    <TabScreen tab="trips" title="Trips">
      <AppText color={colors.muted} style={{ marginTop: -8 }}>
        Latest 100 · updated every minute
      </AppText>
      <View style={styles.search}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput value={q} onChangeText={setQ} placeholder="Trip, driver or passenger phone" placeholderTextColor="#8A8A8A" style={styles.input} accessibilityLabel="Search trips" autoCorrect={false} />
      </View>
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        options={[['All', 'All'], ...(Object.keys(STATUS_COUNTS) as TripStatus[]).map(s => [s, shortStatus(s)] as [Filter, string])]}
      />
      {list.length ? (
        <ListCard>
          {list.map((t, i) => (
            <Row
              key={t.id}
              title={`${t.from} → ${t.to}`}
              sub={`${t.when} · ${t.driver} · ${t.cat} · ${inr(t.fare)}`}
              trail={<Pill label={shortStatus(t.status)} tone={STATUS_TONE[t.status]} />}
              onPress={() => router.push({ pathname: '/trip-detail', params: { id: t.id } })}
              last={i === list.length - 1}
            />
          ))}
        </ListCard>
      ) : (
        <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
          <AppText color={colors.muted}>No trips match.</AppText>
        </Card>
      )}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  input: { flex: 1, fontSize: 16, color: colors.ink, minHeight: 48 },
});
