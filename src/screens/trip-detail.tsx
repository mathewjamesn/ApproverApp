import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Card, ListCard, SectionLabel } from '../ui/Parts';
import { Initials, KVGrid, Pill, Row } from '../ui/Bits';
import { colors } from '../theme';
import { initials, inr, shortStatus, TRIPS } from '../state/data';
import { STATUS_TONE } from './trips';

/** One trip: route, ride PIN, money split and the two people involved. */
export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = TRIPS.find(x => x.id === id) ?? TRIPS[0];
  return (
    <Screen title={t.id} back="/trips" right={<View style={{ marginRight: 8 }}><Pill label={shortStatus(t.status)} tone={STATUS_TONE[t.status]} /></View>}>
      <Card style={{ gap: 14 }}>
        <View style={styles.route}>
          <View style={styles.rail}>
            <View style={styles.pick} />
            <View style={styles.line} />
            <View style={styles.drop} />
          </View>
          <View style={{ flex: 1, gap: 18 }}>
            <AppText variant="bodyStrong">{t.from}</AppText>
            <AppText variant="bodyStrong">{t.to}</AppText>
          </View>
        </View>
        <KVGrid items={[['Distance', `${t.km} km`], ['Ride PIN', t.otp], ['Time', `Today, ${t.when}`], ['Vehicle', t.cat]]} />
      </Card>

      <SectionLabel>Money</SectionLabel>
      <Card>
        <KVGrid items={[['Final fare', inr(t.fare)], ['Payment', t.mode], ['Driver earnings', inr(t.earn)], ['Platform charges', inr(t.plat)], ['GST collected', inr(t.gst)]]} />
      </Card>

      <SectionLabel>People</SectionLabel>
      <ListCard>
        <Row lead={<Initials text={initials(t.driver)} />} title={t.driver} sub={`Driver · +91 ${t.dphone}`} onPress={() => router.push('/driver')} />
        <Row lead={<Initials text={initials(t.pax)} />} title={t.pax} sub={`Passenger · +91 ${t.pphone}`} onPress={() => router.push('/passenger')} last />
      </ListCard>
      <AppText variant="small" color={colors.muted} style={{ marginLeft: 4 }}>
        Prototype: every driver and passenger opens the same sample profile.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  route: { flexDirection: 'row', gap: 12 },
  rail: { width: 18, alignItems: 'center', paddingTop: 4 },
  pick: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.green },
  line: { width: 2, flex: 1, backgroundColor: colors.line, marginVertical: 4, minHeight: 18 },
  drop: { width: 12, height: 12, backgroundColor: colors.ink },
});
