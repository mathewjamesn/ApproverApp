import React, { useState } from 'react';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, TextField } from '../ui/Parts';
import { colors } from '../theme';
import { store, toast, useStore } from '../state/store';

/** Extra percentage on car trips that start at Cochin International Airport. */
export default function Airport() {
  const current = useStore(s => s.airportPct);
  const [val, setVal] = useState(String(current));
  const [code, setCode] = useState('');
  const v = Number(val);
  const ok = val !== '' && v >= 1 && v <= 30;
  return (
    <Screen
      title="Airport surcharge"
      back="/more"
      footer={
        <Button
          label="Update surcharge"
          disabled={!ok || !code}
          height={60}
          onPress={() => {
            store.set({ airportPct: v });
            router.back();
            toast(`Airport surcharge set to ${v}%`);
          }}
        />
      }>
      <AppText color={colors.muted}>Extra percentage on car trips that start at Cochin International Airport.</AppText>
      <Card style={{ backgroundColor: colors.ink }}>
        <AppText color={colors.darkMuted} style={{ fontSize: 15, fontWeight: '600' }}>
          Current surcharge
        </AppText>
        <AppText color={colors.lime} style={{ fontSize: 44, fontWeight: '800', letterSpacing: -1 }}>{`${current}%`}</AppText>
      </Card>
      <Card style={{ gap: 14 }}>
        <TextField label="New value (%) · 1 to 30" value={val} keyboardType="number-pad" maxLength={2} onChangeText={x => setVal(x.replace(/\D/g, ''))} error={val !== '' && !ok ? 'Must be 1 to 30' : null} />
        <TextField label="Authorisation code" value={code} secureTextEntry placeholder="Required" onChangeText={setCode} />
      </Card>
    </Screen>
  );
}
