import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, TextField } from '../ui/Parts';
import { Seg } from '../ui/Bits';
import { colors } from '../theme';
import { store, useStore, type Env } from '../state/store';
import { ENVS } from '../state/data';

/** Sign in with a mobile number (POST login, then a 5-digit OTP). Only approver accounts get in. */
export default function Login() {
  const env = useStore(s => s.env);
  const [mobile, setMobile] = useState('9847000001');
  const valid = /^[6-9]\d{9}$/.test(mobile);
  return (
    <Screen
      footer={
        <Button
          label="Send code"
          disabled={!valid}
          height={60}
          onPress={() => router.push({ pathname: '/otp', params: { mobile } })}
        />
      }>
      <View style={{ gap: 6, marginTop: 24 }}>
        <AppText variant="display">Pikme Approver</AppText>
        <AppText color={colors.muted}>For the TOK support and verification team. Sign in with your registered mobile number.</AppText>
      </View>
      <Card style={{ gap: 14 }}>
        <TextField
          label="Mobile number"
          prefix="+91"
          value={mobile}
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={v => setMobile(v.replace(/\D/g, ''))}
          error={mobile.length === 10 && !valid ? 'Enter a valid Indian mobile number' : null}
        />
      </Card>
      <AppText variant="label" color={colors.muted} style={{ marginLeft: 4 }}>
        Server
      </AppText>
      <Seg<Env> value={env} options={[['PROD', ENVS.PROD.label], ['STG', ENVS.STG.label]]} onChange={e => store.set({ env: e })} />
      <AppText variant="small" color={colors.muted} style={{ marginLeft: 4 }}>
        {ENVS[env].host}
      </AppText>
    </Screen>
  );
}
