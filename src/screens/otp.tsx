import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { colors } from '../theme';
import { store, toast } from '../state/store';

/** 5-digit sign-in code. Prototype: any 5 digits work, 00000 shows the error. */
export default function Otp() {
  const { mobile = '9847000001' } = useLocalSearchParams<{ mobile?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const input = useRef<TextInput>(null);
  return (
    <Screen
      title="Enter the code"
      back="/login"
      footer={
        <Button
          label="Verify and sign in"
          disabled={code.length !== 5}
          height={60}
          onPress={() => {
            if (code === '00000') return setError(true);
            store.set({ signedIn: true });
            if (router.canDismiss()) router.dismissAll();
            router.replace('/home');
            toast('Signed in');
          }}
        />
      }>
      <AppText color={colors.muted}>{`We sent a 5-digit code to +91 ${mobile}.`}</AppText>
      <Pressable onPress={() => input.current?.focus()} style={styles.boxes} accessibilityLabel="Sign-in code">
        {[0, 1, 2, 3, 4].map(i => (
          <View key={i} style={[styles.box, i === code.length ? { borderColor: colors.ink } : null, error ? { borderColor: colors.red } : null]}>
            <AppText style={{ fontSize: 28, fontWeight: '800' }}>{code[i] ?? ''}</AppText>
          </View>
        ))}
        <TextInput
          ref={input}
          autoFocus
          value={code}
          onChangeText={v => {
            setError(false);
            setCode(v.replace(/\D/g, '').slice(0, 5));
          }}
          keyboardType="number-pad"
          maxLength={5}
          style={styles.hidden}
          accessibilityLabel="Sign-in code"
        />
      </Pressable>
      {error ? (
        <AppText color={colors.red}>That code doesn’t match. Check the SMS and try again.</AppText>
      ) : (
        <AppText variant="small" color={colors.muted}>
          Prototype: any 5 digits work. 00000 shows the error.
        </AppText>
      )}
      <Button label="Resend code" variant="text" onPress={() => toast('New code sent')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: 8 },
  box: { flex: 1, height: 64, borderRadius: 16, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
