import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Parts';
import { Icon } from '../ui/Icon';
import { colors } from '../theme';
import { store } from '../state/store';

/** Prototype launcher. Not part of the real app. */
export default function Start() {
  return (
    <Screen bg={colors.white}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <AppText color={colors.lime} style={{ fontSize: 26, fontWeight: '800' }}>
            PA
          </AppText>
        </View>
        <AppText color={colors.white} style={{ fontSize: 15, fontWeight: '700' }}>
          Pikme Approver
        </AppText>
        <AppText color={colors.darkMuted} style={{ fontSize: 14 }}>
          Driver approvals, trips, reports and admin tools
        </AppText>
      </View>
      <View style={{ gap: 6 }}>
        <AppText variant="display">Approver app prototype</AppText>
        <AppText color={colors.muted}>Clickable version 1.0 of the admin screens. Nothing here talks to the server, so try anything.</AppText>
      </View>
      <Button
        label="Start signed out"
        icon="user"
        onPress={() => {
          store.reset();
          router.replace('/login');
        }}
      />
      <Button
        label="Start signed in"
        variant="outline"
        icon="shield"
        onPress={() => {
          store.reset({ signedIn: true });
          router.replace('/home');
        }}
      />
      <Button label="Browse all screens" variant="lime" icon="grid" onPress={() => router.push('/prototype')} />
      <Card style={{ backgroundColor: colors.ground, flexDirection: 'row', gap: 12 }}>
        <Icon name="info" color={colors.muted} />
        <AppText variant="small" color={colors.muted} style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
          The small dark tab on the right edge of every screen opens the prototype menu. Use it to jump to any screen or restart.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 200, borderRadius: 24, marginTop: 8, padding: 20, backgroundColor: colors.ink, justifyContent: 'flex-end', gap: 4 },
  mark: { position: 'absolute', top: 20, left: 20, width: 60, height: 60, borderRadius: 18, backgroundColor: colors.darkCard, alignItems: 'center', justifyContent: 'center' },
});
