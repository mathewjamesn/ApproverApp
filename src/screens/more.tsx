import React from 'react';
import { Alert } from 'react-native';
import { router, type Href } from '../nav';
import { AppText } from '../ui/AppText';
import { ListCard, NavRow, SectionLabel } from '../ui/Parts';
import type { IconName } from '../ui/Icon';
import { TabScreen } from '../ui/Chrome';
import { colors } from '../theme';
import { store, useStore } from '../state/store';
import { ENVS } from '../state/data';

type Item = { icon: IconName; label: string; href?: Href; sub?: string; onPress?: () => void; color?: string };

/** People search, reports, admin tools and app settings. */
export default function More() {
  const env = useStore(s => s.env);
  const groups: { title: string; items: Item[] }[] = [
    {
      title: 'People',
      items: [
        { icon: 'car', label: 'Find a driver', href: { pathname: '/find', params: { who: 'driver' } } },
        { icon: 'users', label: 'Find a passenger', href: { pathname: '/find', params: { who: 'passenger' } } },
      ],
    },
    { title: 'Insights', items: [{ icon: 'earn', label: 'Reports and statistics', href: '/reports' }] },
    {
      title: 'Tools',
      items: [
        { icon: 'key', label: 'Look up login OTP', href: '/otp-lookup' },
        { icon: 'bell', label: 'Send notification', href: '/notify' },
        { icon: 'pct', label: 'Fare multiplier', href: '/fare' },
        { icon: 'plane', label: 'Airport surcharge', href: '/airport' },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: 'server', label: 'Environment', sub: ENVS[env].label, href: '/environment' },
        {
          icon: 'logout',
          label: 'Sign out',
          color: colors.red,
          onPress: () =>
            Alert.alert('Sign out?', 'You’ll need a new code to sign back in.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Sign out',
                style: 'destructive',
                onPress: () => {
                  store.set({ signedIn: false });
                  router.replace('/login');
                },
              },
            ]),
        },
      ],
    },
  ];
  return (
    <TabScreen tab="more" title="More">
      <AppText color={colors.muted} style={{ marginTop: -8 }}>
        Admin User · +91 98470 00001
      </AppText>
      {groups.map(g => (
        <React.Fragment key={g.title}>
          <SectionLabel>{g.title}</SectionLabel>
          <ListCard>
            {g.items.map((it, i) => (
              <NavRow key={it.label} icon={it.icon} label={it.label} sub={it.sub} color={it.color} onPress={it.onPress ?? (() => it.href && router.push(it.href))} last={i === g.items.length - 1} />
            ))}
          </ListCard>
        </React.Fragment>
      ))}
      <AppText variant="small" color={colors.muted} style={{ textAlign: 'center' }}>
        Pikme Approver 2.0 · prototype 1.0
      </AppText>
    </TabScreen>
  );
}
