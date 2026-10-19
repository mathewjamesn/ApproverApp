import React from 'react';
import { Alert, View } from 'react-native';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, Notice, SectionLabel } from '../ui/Parts';
import { Actions, Initials, KVGrid, Pill, Tiles } from '../ui/Bits';
import { colors } from '../theme';
import { store, toast, useStore } from '../state/store';
import { DRIVER, initials } from '../state/data';

/** Driver profile with stats and account actions (block, reset ride, OTP, payment, delete). */
export default function Driver() {
  const blocked = useStore(s => s.driverBlocked);
  const deleted = useStore(s => s.driverDeleted);
  const paid = useStore(s => s.paymentApproved);
  const d = DRIVER;

  if (deleted) {
    return (
      <Screen title="Driver" back="/more">
        <Notice tone="red">This driver account was deleted.</Notice>
        <Button label="Restore (prototype only)" variant="outline" onPress={() => store.set({ driverDeleted: false })} />
      </Screen>
    );
  }

  const confirm = (title: string, body: string, label: string, onYes: () => void, danger = true) =>
    Alert.alert(title, body, [
      { text: 'Cancel', style: 'cancel' },
      { text: label, style: danger ? 'destructive' : 'default', onPress: onYes },
    ]);

  return (
    <Screen title={d.name} back="/more" right={<View style={{ marginRight: 8 }}><Pill label={blocked ? 'Blocked' : d.status} tone={blocked ? 'bad' : 'good'} /></View>}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Initials text={initials(d.name)} size={54} tone="dark" />
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{`${d.name} · ★ ${d.rating}`}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>{`${d.id} · +91 ${d.phone}`}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>{`${d.plate} · ${d.vehicle}`}</AppText>
        </View>
      </Card>

      {blocked ? <Notice tone="red">Blocked: this driver can’t go online or get ride requests.</Notice> : null}

      <Actions
        items={[
          { icon: 'pin', label: 'Locate', onPress: () => router.push('/driver-location') },
          { icon: 'doc', label: 'Documents', onPress: () => Alert.alert('Documents', 'Licence, RC, insurance and permit with expiry dates. Same viewer as the review screen.') },
          { icon: 'car', label: 'Change RC', onPress: () => Alert.alert('Change RC', 'Send the driver a request to upload a new RC for review.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Send request', onPress: () => toast('RC change requested') }]) },
          {
            icon: 'check',
            label: paid ? 'Payment approved' : 'Approve payment',
            onPress: () =>
              paid
                ? toast('Already approved')
                : confirm('Approve ₹612 payment?', 'Marks the pending PhonePe payment as received and clears the dues.', 'Approve', () => {
                    store.set({ paymentApproved: true });
                    toast('Payment approved');
                  }, false),
          },
          { icon: 'trips', label: 'Trips', onPress: () => router.replace('/trips') },
          { icon: 'key', label: 'Login OTP', onPress: () => router.push({ pathname: '/otp-lookup', params: { who: 'Driver', phone: d.phone } }) },
          { icon: 'reset', label: 'Reset ride', onPress: () => confirm('Reset ride status?', `Clears ${d.name}’s current ride state. Use when a driver is stuck after a finished or cancelled ride.`, 'Reset', () => toast('Ride status reset'), false) },
          {
            icon: 'lock',
            label: blocked ? 'Unblock' : 'Block',
            danger: !blocked,
            onPress: () =>
              confirm(blocked ? `Unblock ${d.name}?` : `Block ${d.name}?`, blocked ? 'They can go online again.' : 'They go offline at once and can’t get rides.', blocked ? 'Unblock' : 'Block', () => {
                store.set({ driverBlocked: !blocked });
                toast(blocked ? 'Driver unblocked' : 'Driver blocked');
              }, !blocked),
          },
        ]}
      />

      <SectionLabel>This month</SectionLabel>
      <Tiles
        items={[
          { label: 'Ride requests', value: String(d.rideReq) },
          { label: 'Trips pending payment', value: paid ? '0' : String(d.pendingPay) },
          { label: 'Unpaid distance', value: d.unpaidKm },
          { label: 'Cancellations today', value: String(d.cancelToday) },
        ]}
      />

      <SectionLabel>Device</SectionLabel>
      <Card>
        <KVGrid items={[['App version', d.version], ['Payments verified', d.verified], ['Phone', d.device], ['Last trip', d.lastTrip]]} />
      </Card>

      <Button
        label="Delete driver"
        variant="outline"
        color={colors.red}
        icon="trash"
        style={{ borderColor: colors.red }}
        onPress={() =>
          confirm(`Delete ${d.name}?`, 'Permanently removes the account, documents and vehicle. This can’t be undone.', 'Delete', () => {
            store.set({ driverDeleted: true });
            toast('Driver deleted');
          })
        }
      />
    </Screen>
  );
}
