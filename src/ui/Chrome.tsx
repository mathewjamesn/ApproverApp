import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from '../nav';
import { colors } from '../theme';
import { useStore } from '../state/store';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';
import { Screen } from './Screen';

type TabKey = 'home' | 'approvals' | 'trips' | 'more';
const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'approvals', label: 'Approvals', icon: 'shield' },
  { key: 'trips', label: 'Trips', icon: 'trips' },
  { key: 'more', label: 'More', icon: 'menu' },
];

export const TAB_HEIGHT = 72;

/** Bottom navigation: Home, Approvals, Trips, More. */
export function TabBar({ active }: { active: TabKey }) {
  const insets = useSafeAreaInsets();
  const waiting = useStore(s => s.pending.length);
  return (
    <View style={[styles.tabbar, { height: TAB_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]} accessibilityRole="tablist">
      {TABS.map(t => {
        const on = t.key === active;
        const col = on ? colors.ink : colors.muted;
        const badge = t.key === 'approvals' && waiting > 0 ? waiting : 0;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={badge ? `${t.label}, ${badge} waiting` : t.label}
            onPress={() => !on && router.replace(`/${t.key}`)}
            style={styles.tab}>
            <View style={[styles.tabMark, { backgroundColor: on ? colors.ink : 'transparent' }]} />
            <View>
              <Icon name={t.icon} size={22} color={col} strokeWidth={on ? 2.2 : 1.8} />
              {badge ? (
                <View style={styles.badge}>
                  <AppText color={colors.white} style={{ fontSize: 11, fontWeight: '800' }}>
                    {badge}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText color={col} style={{ fontSize: 12, fontWeight: on ? '800' : '500' }}>
              {t.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Production / Staging pill. Staging is lime so nobody mistakes it for live data. */
export function EnvBadge() {
  const env = useStore(s => s.env);
  const stg = env === 'STG';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Environment: ${stg ? 'Staging' : 'Production'}. Change`} onPress={() => router.push('/environment')} style={[styles.env, stg ? styles.envStg : null]}>
      <AppText color={stg ? colors.ink : colors.white} style={{ fontSize: 12, fontWeight: '800', letterSpacing: 0.6 }}>
        {stg ? 'STAGING' : 'PRODUCTION'}
      </AppText>
    </Pressable>
  );
}

/** A main tab screen: large title, environment pill, scrolling body above the tab bar. */
export function TabScreen({ tab, title, children }: { tab: TabKey; title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <Screen title={title} right={<EnvBadge />} bottomInset={false} contentStyle={{ paddingBottom: TAB_HEIGHT + insets.bottom + 24 }}>
        {children}
      </Screen>
      <TabBar active={tab} />
    </View>
  );
}

/** Small floating tab that opens the prototype menu (jump to any screen, restart). */
export function PrototypeFab() {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (path === '/' || path === '/prototype') return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Prototype menu" onPress={() => router.push('/prototype')} hitSlop={8} style={[styles.fab, { top: insets.top + 132 }]}>
      <Icon name="grid" size={16} color={colors.lime} />
    </Pressable>
  );
}

/** Confirmation message at the bottom of the screen. */
export function Toast() {
  const msg = useStore(s => s.toast);
  const insets = useSafeAreaInsets();
  if (!msg) return null;
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.toast, { bottom: insets.bottom + TAB_HEIGHT + 16 }]}>
      <Icon name="check" size={18} color={colors.lime} strokeWidth={3} />
      <AppText color={colors.white} style={{ flex: 1, fontSize: 15, fontWeight: '700' }}>
        {msg}
      </AppText>
    </View>
  );
}

/** Bottom sheet over a dim backdrop. Tap outside or Back to close. */
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]} accessibilityViewIsModal>
          <View style={styles.grip} />
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <ScrollView contentContainerStyle={{ gap: 14 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tabbar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabMark: { position: 'absolute', top: 0, width: 32, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  badge: { position: 'absolute', top: -6, right: -12, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: colors.red, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  env: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.ink, justifyContent: 'center', marginRight: 8 },
  envStg: { backgroundColor: colors.lime },
  fab: { position: 'absolute', right: 0, width: 34, height: 40, borderTopLeftRadius: 12, borderBottomLeftRadius: 12, backgroundColor: colors.ink, opacity: 0.55, alignItems: 'center', justifyContent: 'center', zIndex: 60, elevation: 60 },
  toast: { position: 'absolute', left: 16, right: 16, zIndex: 70, elevation: 70, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.ink },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 20, gap: 14, maxHeight: '88%' },
  grip: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line },
});
