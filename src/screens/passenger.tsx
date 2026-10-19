import React from 'react';
import { Alert, View } from 'react-native';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, Notice } from '../ui/Parts';
import { Actions, Initials, KVGrid, Pill, Tiles } from '../ui/Bits';
import { colors } from '../theme';
import { store, toast, useStore } from '../state/store';
import { initials, inr, PASSENGER } from '../state/data';

/** Passenger profile with wallet, trips and account actions. */
export default function Passenger() {
  const blocked = useStore(s => s.passengerBlocked);
  const deleted = useStore(s => s.passengerDeleted);
  const p = PASSENGER;

  if (deleted) {
    return (
      <Screen title="Passenger" back="/more">
        <Notice tone="red">This passenger account was deleted.</Notice>
        <Button label="Restore (prototype only)" variant="outline" onPress={() => store.set({ passengerDeleted: false })} />
      </Screen>
    );
  }

  const confirm = (title: string, body: string, label: string, onYes: () => void, danger = true) =>
    Alert.alert(title, body, [
      { text: 'Cancel', style: 'cancel' },
      { text: label, style: danger ? 'destructive' : 'default', onPress: onYes },
    ]);

  return (
    <Screen title={p.name} back="/more" right={<View style={{ marginRight: 8 }}><Pill label={blocked ? 'Blocked' : 'Active'} tone={blocked ? 'bad' : 'good'} /></View>}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Initials text={initials(p.name)} size={54} tone="dark" />
        <View style={{ flex: 1 }}>
          <AppText variant="heading">{p.name}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>{`${p.id} · +91 ${p.phone}`}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>
            {p.email}
          </AppText>
        </View>
      </Card>

      {blocked ? <Notice tone="red">Blocked: this passenger can’t book rides.</Notice> : null}

      <Tiles
        items={[
          { label: 'Wallet', value: inr(p.wallet) },
          { label: 'Distance', value: `${p.km} km` },
          { label: 'Carbon saved', value: `${p.carbon} kg` },
          { label: 'Cancellations', value: `${p.cancelToday} today`, note: `${p.cancelTotal} in total` },
        ]}
      />

      <Actions
        items={[
          { icon: 'trips', label: 'Trips', onPress: () => router.replace('/trips') },
          { icon: 'key', label: 'Login OTP', onPress: () => router.push({ pathname: '/otp-lookup', params: { who: 'Passenger', phone: p.phone } }) },
          { icon: 'reset', label: 'Reset ride', onPress: () => confirm('Reset ride status?', `Clears ${p.name}’s current ride state.`, 'Reset', () => toast('Ride status reset'), false) },
          {
            icon: 'lock',
            label: blocked ? 'Unblock' : 'Block',
            danger: !blocked,
            onPress: () =>
              confirm(blocked ? `Unblock ${p.name}?` : `Block ${p.name}?`, blocked ? 'They can book rides again.' : 'Blocked passengers can’t book rides.', blocked ? 'Unblock' : 'Block', () => {
                store.set({ passengerBlocked: !blocked });
                toast(blocked ? 'Passenger unblocked' : 'Passenger blocked');
              }, !blocked),
          },
        ]}
      />

      <Card>
        <KVGrid items={[['Ride status', p.status], ['Latest trip', p.latest], ['App version', p.version], ['Profile', 'Complete']]} />
      </Card>

      <Button
        label="Delete passenger"
        variant="outline"
        color={colors.red}
        icon="trash"
        style={{ borderColor: colors.red }}
        onPress={() =>
          confirm(`Delete ${p.name}?`, `Removes the profile and the ${inr(p.wallet)} wallet balance. This can’t be undone.`, 'Delete', () => {
            store.set({ passengerDeleted: true });
            toast('Passenger deleted');
          })
        }
      />
    </Screen>
  );
}
