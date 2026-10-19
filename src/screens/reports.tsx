import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Card, SectionLabel } from '../ui/Parts';
import { RegChart, TripsChart, ValueBars } from '../ui/Charts';
import { colors } from '../theme';
import { REG_STAGES, REG_SUMMARY, STATUS_COUNTS, type TripStatus } from '../state/data';

/** Registrations by state and stage, today’s trip outcomes and the 14-day trend. */
export default function Reports() {
  const total = Object.values(STATUS_COUNTS).reduce((a, b) => a + b, 0);
  const cancelled = STATUS_COUNTS['Cancelled (driver)'] + STATUS_COUNTS['Cancelled (passenger)'];
  return (
    <Screen title="Reports" back="/more">
      <SectionLabel>Driver registrations by state</SectionLabel>
      <Card style={{ gap: 14 }}>
        <RegChart />
        {/* Table view: the same numbers, readable without the colours. */}
        <View accessibilityRole="summary">
          <View style={[styles.tr, styles.th]}>
            <AppText style={[styles.cell, styles.first, styles.head]}>State</AppText>
            {REG_STAGES.map(([k, l]) => (
              <AppText key={k} style={[styles.cell, styles.head]} numberOfLines={1}>
                {l}
              </AppText>
            ))}
          </View>
          {REG_SUMMARY.map(r => (
            <View key={r.state} style={styles.tr}>
              <AppText style={[styles.cell, styles.first, { fontWeight: '800' }]} numberOfLines={1}>
                {r.state}
              </AppText>
              {REG_STAGES.map(([k]) => (
                <AppText key={k} style={styles.cell}>
                  {r[k].toLocaleString('en-IN')}
                </AppText>
              ))}
            </View>
          ))}
        </View>
      </Card>

      <SectionLabel>Today’s trips by outcome</SectionLabel>
      <Card style={{ gap: 12 }}>
        <ValueBars rows={(Object.keys(STATUS_COUNTS) as TripStatus[]).map(k => ({ label: k, value: STATUS_COUNTS[k] }))} />
        <AppText variant="small" color={colors.muted}>
          {`Completion ${Math.round((STATUS_COUNTS.Completed / total) * 100)}% · cancellations ${Math.round((cancelled / total) * 100)}% of ${total} trips`}
        </AppText>
      </Card>

      <SectionLabel>Completed trips, last 14 days</SectionLabel>
      <Card>
        <TripsChart />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 8 },
  th: { borderTopWidth: 0 },
  cell: { flex: 1, fontSize: 13, textAlign: 'right', fontVariant: ['tabular-nums'] },
  first: { flex: 1.3, textAlign: 'left' },
  head: { color: colors.muted, fontWeight: '700', fontSize: 12 },
});
