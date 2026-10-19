import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { router } from '../nav';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { MapArt } from '../ui/Map';
import { KVGrid, Pill } from '../ui/Bits';
import { colors, shadow } from '../theme';
import { toast, useStore } from '../state/store';
import { DRIVER } from '../state/data';

/** Driver’s live position from the location store (Cosmos DriverLocationDetails). */
export default function DriverLocation() {
  const insets = useSafeAreaInsets();
  const blocked = useStore(s => s.driverBlocked);
  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }}>
      <MapArt pulse={!blocked} carAt={[195, 260]} />
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={[styles.back, shadow, { top: insets.top + 12 }]}>
        <Icon name="back" size={24} />
      </Pressable>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.grip} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="title">{DRIVER.name}</AppText>
          <Pill label={blocked ? 'Blocked' : 'Online · free'} tone={blocked ? 'bad' : 'good'} />
        </View>
        <AppText color={colors.muted}>{`Near ${DRIVER.area} · updated ${DRIVER.lastSeen}`}</AppText>
        <KVGrid items={[['Vehicle', DRIVER.plate], ['Category', 'Sedan'], ['Busy', 'No'], ['Booked', 'No']]} />
        <Button label="Refresh location" icon="reset" variant="outline" onPress={() => toast('Location refreshed')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', left: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 20, gap: 12 },
  grip: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line },
});
