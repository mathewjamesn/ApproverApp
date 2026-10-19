import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from '../nav';
import { AppText } from '../ui/AppText';
import { Card, ListCard, SectionLabel } from '../ui/Parts';
import { Icon } from '../ui/Icon';
import { Pill, Row, Tiles, type Tone } from '../ui/Bits';
import { TabScreen } from '../ui/Chrome';
import { TripsChart } from '../ui/Charts';
import { colors } from '../theme';
import { useStore } from '../state/store';
import { APPLICANTS, initials } from '../state/data';

/** Dashboard: the review queue first, then today’s numbers, alerts and the trip trend. */
export default function Home() {
  const pending = useStore(s => s.pending);
  const paymentApproved = useStore(s => s.paymentApproved);
  const waiting = APPLICANTS.filter(a => pending.includes(a.id));

  const alerts: { tone: Tone; label: string; title: string; sub: string; go: () => void }[] = [];
  if (pending.includes('d3')) alerts.push({ tone: 'bad', label: 'Urgent', title: 'Licence expires in 10 days', sub: 'Arun Mathew · waiting for review', go: () => router.push({ pathname: '/review', params: { id: 'd3', step: 'licence' } }) });
  alerts.push({ tone: 'bad', label: 'Urgent', title: 'Trip stuck in Started for 3 h', sub: 'TRP-90409 · Shaji P', go: () => router.push({ pathname: '/trip-detail', params: { id: 'TRP-90409' } }) });
  if (pending.includes('d2')) alerts.push({ tone: 'warn', label: 'Soon', title: 'Insurance expires 02 Nov', sub: 'Fathima Rasheed · waiting for review', go: () => router.push({ pathname: '/review', params: { id: 'd2', step: 'vehicle' } }) });
  if (!paymentApproved) alerts.push({ tone: 'info', label: 'Info', title: '1 payment waiting for approval', sub: 'Anil Kumar · ₹612', go: () => router.push('/driver') });

  return (
    <TabScreen tab="home" title="Good evening">
      <AppText color={colors.muted} style={{ marginTop: -8 }}>
        Monday, 19 Oct · 742 trips so far today
      </AppText>
      <Pressable accessibilityRole="button" accessibilityLabel={`${waiting.length} drivers waiting for your review. Start reviewing`} onPress={() => router.replace('/approvals')} style={styles.hero}>
        <AppText color={colors.darkMuted} style={{ fontSize: 15, fontWeight: '600' }}>
          Waiting for your review
        </AppText>
        <View style={styles.heroRow}>
          <AppText color={colors.lime} style={{ fontSize: 52, fontWeight: '800', letterSpacing: -1.5, lineHeight: 58 }}>
            {waiting.length}
          </AppText>
          <View style={styles.faces}>
            {waiting.slice(0, 4).map((a, i) => (
              <View key={a.id} style={[styles.face, { marginLeft: i ? -10 : 0 }]}>
                <AppText color={colors.white} style={{ fontSize: 12, fontWeight: '800' }}>
                  {initials(a.name)}
                </AppText>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.heroCta}>
          <AppText color={colors.white} style={{ fontSize: 16, fontWeight: '800' }}>
            {waiting.length ? 'Start reviewing' : 'All caught up'}
          </AppText>
          <Icon name="chev" size={18} color={colors.white} />
        </View>
      </Pressable>

      <Tiles
        onPress={k => (k === 'trips' ? router.replace('/trips') : k === 'reports' ? router.push('/reports') : router.push({ pathname: '/find', params: { who: k } }))}
        items={[
          { key: 'driver', label: 'Active drivers', value: '1,519', note: '▲ 38 this week', noteColor: colors.green },
          { key: 'trips', label: 'Trips today', value: '742', note: '▼ 11% vs yesterday', noteColor: colors.red },
          { key: 'passenger', label: 'Passengers', value: '53,418', note: '▲ 412 this week', noteColor: colors.green },
          { key: 'reports', label: 'Completion', value: '82%', note: 'of today’s trips' },
        ]}
      />

      <SectionLabel>Needs attention</SectionLabel>
      <ListCard>
        {alerts.map((a, i) => (
          <Row key={a.title} lead={<Pill label={a.label} tone={a.tone} />} title={a.title} sub={a.sub} onPress={a.go} last={i === alerts.length - 1} />
        ))}
      </ListCard>

      <SectionLabel>Completed trips, last 14 days</SectionLabel>
      <Card>
        <TripsChart />
      </Card>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.ink, borderRadius: 22, padding: 18, gap: 4 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  faces: { flexDirection: 'row', marginBottom: 8 },
  face: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.darkCard, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
});
