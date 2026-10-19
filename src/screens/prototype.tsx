import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, type Href } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { ListCard, SectionLabel } from '../ui/Parts';
import { Icon } from '../ui/Icon';
import { colors } from '../theme';
import { store, type State } from '../state/store';

type Item = { label: string; href: Href; prep?: Partial<State> };

const GROUPS: { title: string; items: Item[] }[] = [
  {
    title: 'Sign in',
    items: [
      { label: 'Sign in with mobile number', href: '/login', prep: { signedIn: false } },
      { label: 'Enter the 5-digit code', href: { pathname: '/otp', params: { mobile: '9847000001' } }, prep: { signedIn: false } },
    ],
  },
  {
    title: 'Main tabs',
    items: [
      { label: 'Home', href: '/home' },
      { label: 'Approvals: waiting', href: { pathname: '/approvals', params: { tab: 'pending' } } },
      { label: 'Approvals: sent back', href: { pathname: '/approvals', params: { tab: 'rejected' } } },
      { label: 'Trips', href: '/trips' },
      { label: 'More', href: '/more' },
    ],
  },
  {
    title: 'Driver approval',
    items: [
      { label: 'Review: profile check', href: { pathname: '/review', params: { id: 'd4', step: 'profile' } } },
      { label: 'Review: licence expiring soon', href: { pathname: '/review', params: { id: 'd3', step: 'licence' } } },
      { label: 'Review: insurance expiring soon', href: { pathname: '/review', params: { id: 'd2', step: 'vehicle' } } },
    ],
  },
  {
    title: 'People and trips',
    items: [
      { label: 'Find a driver', href: { pathname: '/find', params: { who: 'driver' } } },
      { label: 'Driver profile', href: '/driver', prep: { driverDeleted: false } },
      { label: 'Driver profile, blocked', href: '/driver', prep: { driverDeleted: false, driverBlocked: true } },
      { label: 'Driver location', href: '/driver-location' },
      { label: 'Find a passenger', href: { pathname: '/find', params: { who: 'passenger' } } },
      { label: 'Passenger profile', href: '/passenger', prep: { passengerDeleted: false } },
      { label: 'Trip details', href: { pathname: '/trip-detail', params: { id: 'TRP-90412' } } },
    ],
  },
  {
    title: 'Insights and tools',
    items: [
      { label: 'Reports', href: '/reports' },
      { label: 'Look up login OTP', href: '/otp-lookup' },
      { label: 'Send notification', href: '/notify' },
      { label: 'Fare multiplier', href: '/fare' },
      { label: 'Airport surcharge', href: '/airport' },
      { label: 'Environment', href: '/environment' },
    ],
  },
];

export default function PrototypeMenu() {
  const go = (i: Item) => {
    // Everything past sign-in needs a signed-in approver.
    const path = typeof i.href === 'string' ? i.href : i.href.pathname;
    store.set({ ...(['/login', '/otp'].includes(path) ? {} : { signedIn: true }), ...(i.prep ?? {}) });
    if (router.canDismiss()) router.dismissAll();
    router.replace(i.href);
  };
  return (
    <Screen title="Prototype" back>
      {GROUPS.map(g => (
        <View key={g.title} style={{ gap: 8 }}>
          <SectionLabel>{g.title}</SectionLabel>
          <ListCard style={{ paddingVertical: 0 }}>
            {g.items.map((i, idx) => (
              <Pressable key={i.label} accessibilityRole="button" onPress={() => go(i)} style={[styles.row, idx < g.items.length - 1 ? styles.divider : null]}>
                <AppText variant="bodyStrong" style={{ flex: 1 }}>
                  {i.label}
                </AppText>
                <Icon name="chev" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </ListCard>
        </View>
      ))}
      <Button
        label="Restart prototype"
        variant="outline"
        icon="reset"
        onPress={() => {
          store.reset();
          if (router.canDismiss()) router.dismissAll();
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.line },
});
