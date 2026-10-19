import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, OptionField, TextField } from '../ui/Parts';
import { Seg } from '../ui/Bits';
import { colors } from '../theme';
import { store, toast } from '../state/store';
import { AREAS, inr } from '../state/data';

type Veh = 'Car' | 'Auto';
type Act = 'Increase' | 'Decrease';

/** Raise or lower all fares for one vehicle type in one area (e.g. heavy rain). Needs an authorisation code. */
export default function Fare() {
  const [veh, setVeh] = useState<Veh>('Car');
  const [act, setAct] = useState<Act>('Increase');
  const [area, setArea] = useState('Kerala');
  const [pct, setPct] = useState('10');
  const [code, setCode] = useState('');
  const v = Number(pct);
  const pctOk = pct !== '' && v >= 0 && v <= 80;
  const example = 200 * (1 + ((act === 'Increase' ? 1 : -1) * (pctOk ? v : 0)) / 100);
  const valid = pctOk && code.length > 0;
  return (
    <Screen
      title="Fare multiplier"
      back="/more"
      footer={
        <Button
          label={`Apply to ${veh.toLowerCase()} fares`}
          disabled={!valid}
          height={60}
          onPress={() =>
            Alert.alert('Apply fare change?', `${act} ${veh.toLowerCase()} fares in ${area} by ${v}%.`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Apply',
                onPress: () => {
                  store.set({ fareChanges: [`${act} ${veh} ${area} ${v}%`, ...store.get().fareChanges] });
                  router.back();
                  toast('Fare multiplier updated');
                },
              },
            ])
          }
        />
      }>
      <AppText color={colors.muted}>Raise or lower all fares for one vehicle type in one area, for example during heavy rain.</AppText>
      <Seg<Veh> value={veh} options={[['Car', 'Car'], ['Auto', 'Auto']]} onChange={setVeh} />
      <Seg<Act> value={act} options={[['Increase', 'Increase'], ['Decrease', 'Decrease']]} onChange={setAct} />
      <Card style={{ gap: 14 }}>
        <OptionField label="Area" value={area} options={AREAS} onChange={setArea} />
        <TextField label="Change (%) · 0 to 80" value={pct} keyboardType="number-pad" maxLength={2} onChangeText={x => setPct(x.replace(/\D/g, ''))} error={pct !== '' && !pctOk ? 'Must be 0 to 80' : null} />
        <View style={styles.example}>
          <AppText color={colors.muted} style={{ flex: 1 }}>{`A ₹200 ${veh.toLowerCase()} fare becomes`}</AppText>
          <AppText style={{ fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{inr(example)}</AppText>
        </View>
        <TextField label="Authorisation code" value={code} secureTextEntry placeholder="Required" onChangeText={setCode} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  example: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, backgroundColor: colors.ground },
});
