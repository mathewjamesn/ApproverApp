import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export type Tone = 'good' | 'warn' | 'bad' | 'info' | 'mute';
const TONES: Record<Tone, [string, string]> = {
  good: [colors.greenTint, colors.green],
  warn: [colors.warnTint, colors.warnText],
  bad: [colors.redTint, colors.red],
  info: [colors.blueTint, colors.blue],
  mute: [colors.ground, colors.muted],
};

/** Small rounded status label. Colour never carries the meaning alone: the text says it. */
export function Pill({ label, tone, icon }: { label: string; tone: Tone; icon?: IconName }) {
  const [bg, fg] = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={12} color={fg} strokeWidth={2.6} /> : null}
      <AppText color={fg} style={{ fontSize: 12, fontWeight: '800' }}>
        {label}
      </AppText>
    </View>
  );
}

/** Rounded-square initials, as used in lists. */
export function Initials({ text, size = 44, tone = 'mute' }: { text: string; size?: number; tone?: 'mute' | 'bad' | 'dark' }) {
  const bg = tone === 'dark' ? colors.ink : tone === 'bad' ? colors.redTint : colors.ground;
  const fg = tone === 'dark' ? colors.lime : tone === 'bad' ? colors.red : colors.ink;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <AppText color={fg} style={{ fontSize: size * 0.34, fontWeight: '800' }}>
        {text}
      </AppText>
    </View>
  );
}

/** Two-up stat tiles. */
export function Tiles({ items, onPress }: { items: { label: string; value: string; note?: string; noteColor?: string; key?: string }[]; onPress?: (key: string) => void }) {
  return (
    <View style={styles.tiles}>
      {items.map(t => {
        const body = (
          <>
            <AppText variant="small" color={colors.muted} style={{ fontWeight: '700' }}>
              {t.label}
            </AppText>
            <AppText style={{ fontSize: 24, fontWeight: '800', letterSpacing: -0.5, fontVariant: ['tabular-nums'] }}>{t.value}</AppText>
            {t.note ? (
              <AppText variant="small" color={t.noteColor ?? colors.muted} style={{ fontWeight: '700' }}>
                {t.note}
              </AppText>
            ) : null}
          </>
        );
        return onPress && t.key ? (
          <Pressable key={t.label} accessibilityRole="button" onPress={() => onPress(t.key!)} style={({ pressed }) => [styles.tile, pressed ? { opacity: 0.7 } : null]}>
            {body}
          </Pressable>
        ) : (
          <View key={t.label} style={styles.tile}>
            {body}
          </View>
        );
      })}
    </View>
  );
}

/** Segmented control. */
export function Seg<T extends string>({ value, options, onChange, dark }: { value: T; options: [T, string][]; onChange: (v: T) => void; dark?: boolean }) {
  return (
    <View style={[styles.seg, dark ? { backgroundColor: colors.ground } : null]} accessibilityRole="tablist">
      {options.map(([k, l]) => {
        const on = k === value;
        return (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(k)} style={[styles.segBtn, on ? styles.segOn : null]}>
            <AppText color={on ? colors.white : colors.muted} style={{ fontSize: 14, fontWeight: '800', textAlign: 'center' }} numberOfLines={1}>
              {l}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Horizontally scrolling filter chips. */
export function Chips<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label?: (k: T) => string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map(([k, l]) => {
        const on = k === value;
        return (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label ? label(k) : l} onPress={() => onChange(k)} style={[styles.chip, on ? styles.chipOn : null]}>
            <AppText color={on ? colors.white : colors.ink} style={{ fontSize: 14, fontWeight: '700' }}>
              {l}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Tappable list row with a leading element, two lines of text and a trailing element. */
export function Row({ lead, title, sub, trail, onPress, last, titleColor }: { lead?: React.ReactNode; title: string; sub?: string; trail?: React.ReactNode; onPress?: () => void; last?: boolean; titleColor?: string }) {
  const inner = (
    <>
      {lead}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText variant="bodyStrong" color={titleColor} numberOfLines={1}>
          {title}
        </AppText>
        {sub ? (
          <AppText variant="small" color={colors.muted} numberOfLines={2} style={{ fontSize: 14, marginTop: 2 }}>
            {sub}
          </AppText>
        ) : null}
      </View>
      {trail}
      {onPress ? <Icon name="chev" size={18} color={colors.muted} /> : null}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, last ? null : styles.divider, pressed ? { opacity: 0.6 } : null]}>
      {inner}
    </Pressable>
  ) : (
    <View style={[styles.row, last ? null : styles.divider]}>{inner}</View>
  );
}

/** Two-column label/value grid. */
export function KVGrid({ items, style }: { items: [string, string][]; style?: ViewStyle }) {
  return (
    <View style={[styles.kv, style]}>
      {items.map(([k, v]) => (
        <View key={k} style={styles.kvCell}>
          <AppText variant="small" color={colors.muted} style={{ fontWeight: '700' }}>
            {k}
          </AppText>
          <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
            {v}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Grid of round action buttons (driver and passenger profiles). */
export function Actions({ items }: { items: { icon: IconName; label: string; onPress: () => void; danger?: boolean }[] }) {
  return (
    <View style={styles.actions}>
      {items.map(a => (
        <Pressable key={a.label} accessibilityRole="button" onPress={a.onPress} style={({ pressed }) => [styles.act, pressed ? { opacity: 0.7 } : null]}>
          <View style={[styles.actIcon, a.danger ? { backgroundColor: colors.redTint } : null]}>
            <Icon name={a.icon} size={20} color={a.danger ? colors.red : colors.ink} />
          </View>
          <AppText style={{ fontSize: 12, fontWeight: '700', textAlign: 'center' }} numberOfLines={2}>
            {a.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.white, borderRadius: 18, padding: 14, gap: 2 },
  seg: { flexDirection: 'row', gap: 6, padding: 5, backgroundColor: colors.white, borderRadius: 14 },
  segBtn: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segOn: { backgroundColor: colors.ink },
  chip: { height: 40, paddingHorizontal: 16, borderRadius: 20, justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 60 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  kv: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  kvCell: { width: '50%', paddingRight: 8, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  act: { width: '23%', flexGrow: 1, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', gap: 6 },
  actIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.ground, alignItems: 'center', justifyContent: 'center' },
});
