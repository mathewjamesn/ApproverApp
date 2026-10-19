import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors, series } from '../theme';
import { AppText } from './AppText';
import { dayLabel, REG_STAGES, REG_SUMMARY, TRIPS_DAILY } from '../state/data';

/** Bar with only its top corners rounded (4 px), anchored to the baseline. */
const topRounded = (x: number, top: number, w: number, base: number, r = 4) => {
  const rr = Math.min(r, w / 2, base - top);
  return `M${x} ${base}V${top + rr}a${rr} ${rr} 0 0 1 ${rr} ${-rr}h${w - 2 * rr}a${rr} ${rr} 0 0 1 ${rr} ${rr}V${base}Z`;
};

/** Read-out line above a chart: shows the tapped value (tap is the phone's hover). */
function Readout({ text }: { text: string }) {
  return (
    <View style={styles.readout} accessibilityLiveRegion="polite">
      <AppText style={{ fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{text}</AppText>
    </View>
  );
}

/** Completed trips per day for the last 14 days. One series, so no legend: the title names it. */
export function TripsChart() {
  const n = TRIPS_DAILY.length;
  const [sel, setSel] = useState(n - 1);
  const W = 340;
  const H = 160;
  const L = 34;
  const R = 4;
  const T = 18;
  const B = 22;
  const max = 1000;
  const bw = (W - L - R) / n;
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const base = y(0);
  const total = TRIPS_DAILY.reduce((a, b) => a + b, 0);
  return (
    <View style={{ gap: 6 }}>
      <Readout text={`${sel === n - 1 ? 'Today' : dayLabel(sel)} · ${TRIPS_DAILY[sel]} trips`} />
      <Svg width="100%" height={undefined} style={{ aspectRatio: W / H }} viewBox={`0 0 ${W} ${H}`} accessibilityLabel={`Completed trips per day, last 14 days. ${total} in total, today ${TRIPS_DAILY[n - 1]}.`}>
        {[0, 500, 1000].map(v => (
          <React.Fragment key={v}>
            <Line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={colors.line} strokeWidth={1} />
            <SvgText x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="10" fill={colors.muted}>
              {v}
            </SvgText>
          </React.Fragment>
        ))}
        {TRIPS_DAILY.map((v, i) => {
          const x = L + i * bw + 1;
          const w = bw - 2; // 2 px surface gap between bars
          const on = i === sel;
          return (
            <React.Fragment key={i}>
              <Path d={topRounded(x, y(v), w, base)} fill={series[0]} opacity={on ? 1 : 0.55} />
              {/* Hit target: the whole column, bigger than the bar. */}
              <Rect x={L + i * bw} y={T} width={bw} height={H - T - B} fill="transparent" onPress={() => setSel(i)} />
              {i % 3 === 1 || i === n - 1 ? (
                <SvgText x={x + w / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={colors.muted}>
                  {i === n - 1 ? 'Today' : dayLabel(i)}
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
        <SvgText x={L + sel * bw + bw / 2} y={y(TRIPS_DAILY[sel]) - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill={colors.ink}>
          {TRIPS_DAILY[sel]}
        </SvgText>
      </Svg>
    </View>
  );
}

/** Driver registrations by state, stacked by stage. Legend always shown; the table below has the numbers. */
export function RegChart() {
  const [sel, setSel] = useState<{ row: number; stage: number } | null>({ row: 0, stage: 1 });
  const W = 340;
  const L = 76;
  const R = 44;
  const rh = 32;
  const H = REG_SUMMARY.length * rh + 4;
  const s = sel ? REG_SUMMARY[sel.row] : null;
  const total = (r: (typeof REG_SUMMARY)[number]) => REG_STAGES.reduce((a, [k]) => a + r[k], 0);
  return (
    <View style={{ gap: 8 }}>
      <Readout
        text={
          s && sel
            ? `${s.state} · ${REG_STAGES[sel.stage][1]} ${s[REG_STAGES[sel.stage][0]].toLocaleString('en-IN')} (${Math.round((s[REG_STAGES[sel.stage][0]] / total(s)) * 100)}%)`
            : 'Tap a bar for its numbers'
        }
      />
      <Svg width="100%" style={{ aspectRatio: W / H }} viewBox={`0 0 ${W} ${H}`} accessibilityLabel="Driver registrations by state and stage. The table below lists every number.">
        {REG_SUMMARY.map((r, i) => {
          const tot = total(r);
          let x = L;
          const top = i * rh;
          return (
            <React.Fragment key={r.state}>
              <SvgText x={L - 8} y={top + 18} textAnchor="end" fontSize="11" fontWeight="700" fill={colors.ink}>
                {r.state}
              </SvgText>
              {REG_STAGES.map(([k], si) => {
                const w = ((W - L - R) * r[k]) / tot;
                const x0 = x;
                x += w;
                const on = sel?.row === i && sel?.stage === si;
                return (
                  <Rect
                    key={k}
                    x={x0}
                    y={top + 6}
                    width={Math.max(w - 2, 1)}
                    height={18}
                    rx={4}
                    fill={series[si]}
                    stroke={on ? colors.ink : 'none'}
                    strokeWidth={on ? 2 : 0}
                    onPress={() => setSel({ row: i, stage: si })}
                  />
                );
              })}
              <SvgText x={W - R + 6} y={top + 19} fontSize="11" fontWeight="700" fill={colors.ink}>
                {tot.toLocaleString('en-IN')}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        {REG_STAGES.map(([k, l], si) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: series[si] }]} />
            <AppText variant="small" style={{ fontWeight: '600' }}>
              {l}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

/** One horizontal bar per row, with the value written beside it (magnitude, single hue). */
export function ValueBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map(r => r.value));
  return (
    <View style={{ gap: 10 }}>
      {rows.map(r => (
        <View key={r.label} style={styles.vbRow} accessibilityLabel={`${r.label}: ${r.value}`}>
          <AppText variant="small" style={{ width: 132, fontWeight: '600' }} numberOfLines={1}>
            {r.label}
          </AppText>
          <View style={styles.vbTrack}>
            <View style={[styles.vbFill, { width: `${Math.max(2, (r.value / max) * 100)}%` }]} />
          </View>
          <AppText style={{ width: 40, textAlign: 'right', fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{r.value}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  readout: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.ground },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  vbRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vbTrack: { flex: 1, height: 10, borderRadius: 4, backgroundColor: colors.ground, overflow: 'hidden' },
  vbFill: { height: 10, borderRadius: 4, backgroundColor: series[0] },
});
