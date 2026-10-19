import React, { useState } from 'react';
import { useLocalSearchParams } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, Notice, TextField } from '../ui/Parts';
import { Seg } from '../ui/Bits';
import { colors } from '../theme';

type Who = 'Driver' | 'Passenger';

/** Current login OTP for a user who can’t receive the SMS. */
export default function OtpLookup() {
  const params = useLocalSearchParams<{ who?: Who; phone?: string }>();
  const [who, setWho] = useState<Who>(params.who ?? 'Driver');
  const [phone, setPhone] = useState(params.phone ?? '9846122031');
  const [otp, setOtp] = useState<string | null>(null);
  const valid = /^\d{10}$/.test(phone);
  return (
    <Screen title="Login OTP" back="/more" footer={<Button label="Get OTP" icon="key" disabled={!valid} height={60} onPress={() => setOtp(who === 'Driver' ? '48213' : '71840')} />}>
      <Notice tone="warn">Only for users who can’t receive the SMS. Confirm who you’re speaking to before reading it out.</Notice>
      <Seg<Who>
        value={who}
        options={[
          ['Driver', 'Driver'],
          ['Passenger', 'Passenger'],
        ]}
        onChange={w => {
          setWho(w);
          setOtp(null);
        }}
      />
      <Card>
        <TextField label="Mobile number" prefix="+91" value={phone} keyboardType="number-pad" maxLength={10} onChangeText={v => { setPhone(v.replace(/\D/g, '')); setOtp(null); }} />
      </Card>
      {otp ? (
        <Card style={{ alignItems: 'center', gap: 8, backgroundColor: colors.ink }}>
          <AppText color={colors.darkMuted} style={{ fontSize: 14 }}>{`Current OTP · ${who.toLowerCase()} +91 ${phone}`}</AppText>
          <AppText selectable color={colors.lime} style={{ fontSize: 46, fontWeight: '800', letterSpacing: 10, fontVariant: ['tabular-nums'] }} accessibilityLabel={`OTP ${otp.split('').join(' ')}`}>
            {otp}
          </AppText>
          <AppText color={colors.darkMuted} style={{ fontSize: 13 }}>
            Long-press the code to copy it
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}
