import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from '../nav';
import { Screen } from '../ui/Screen';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card, SectionLabel, TextField } from '../ui/Parts';
import { Seg } from '../ui/Bits';
import { colors } from '../theme';
import { toast } from '../state/store';

type Who = 'Driver' | 'Passenger';

/** Push a notification to every driver or every passenger. */
export default function Notify() {
  const [who, setWho] = useState<Who>('Driver');
  const [title, setTitle] = useState('');
  const [msg, setMsg] = useState('');
  const ready = title.trim().length > 0 && msg.trim().length > 0;
  return (
    <Screen
      title="Send notification"
      back="/more"
      footer={
        <Button
          label={`Send to all ${who.toLowerCase()}s`}
          icon="bell"
          disabled={!ready}
          height={60}
          onPress={() =>
            Alert.alert(`Send to all ${who.toLowerCase()}s?`, `“${title.trim()}” goes out now and can’t be recalled.`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Send now',
                onPress: () => {
                  router.back();
                  toast('Notification sent');
                },
              },
            ])
          }
        />
      }>
      <Seg<Who>
        value={who}
        options={[
          ['Driver', 'All drivers'],
          ['Passenger', 'All passengers'],
        ]}
        onChange={setWho}
      />
      <Card style={{ gap: 14 }}>
        <TextField label="Title" value={title} maxLength={60} placeholder="Onam bonus this weekend" onChangeText={setTitle} hint={`${title.length}/60`} />
        <TextField label="Message" value={msg} maxLength={240} multiline placeholder="Complete 20 trips Fri–Sun and earn ₹500 extra." onChangeText={setMsg} style={{ minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }} hint={`${msg.length}/240`} />
      </Card>
      <SectionLabel>Preview</SectionLabel>
      <View style={styles.preview}>
        <View style={styles.appIcon}>
          <AppText color={colors.lime} style={{ fontSize: 12, fontWeight: '800' }}>
            {who === 'Driver' ? 'TD' : 'TOK'}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyStrong">{title.trim() || 'Title'}</AppText>
          <AppText color={colors.muted} style={{ fontSize: 14 }}>
            {msg.trim() || 'Message text'}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 18, backgroundColor: colors.white },
  appIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
