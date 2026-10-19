import React, { useState } from 'react';
import { router, useLocalSearchParams } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, TextField } from '../ui/Parts';
import { colors } from '../theme';

/** Look up a driver or passenger by mobile number. */
export default function Find() {
  const who = useLocalSearchParams<{ who?: string }>().who === 'passenger' ? 'passenger' : 'driver';
  const [mobile, setMobile] = useState(who === 'driver' ? '9847012390' : '9847012345');
  const valid = /^\d{10}$/.test(mobile);
  return (
    <Screen title={who === 'driver' ? 'Find a driver' : 'Find a passenger'} back="/more" footer={<Button label="Search" icon="search" disabled={!valid} height={60} onPress={() => router.push(`/${who}`)} />}>
      <Card style={{ gap: 12 }}>
        <TextField label="Mobile number" prefix="+91" value={mobile} keyboardType="number-pad" maxLength={10} onChangeText={v => setMobile(v.replace(/\D/g, ''))} />
      </Card>
      <AppText color={colors.muted}>
        {who === 'driver' ? 'Opens the driver’s profile with their stats, documents and account actions.' : 'Opens the passenger’s profile with wallet, trips and account actions.'}
      </AppText>
      <AppText variant="small" color={colors.muted}>
        Prototype: any 10-digit number opens the sample profile.
      </AppText>
    </Screen>
  );
}
