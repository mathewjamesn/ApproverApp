import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { fetchTripsByDriver } from '../../../services/api/tripsApi';
import { getEffectiveTripStatus } from '../../../utils/tripHelpers';

interface Props {
  phone?: string | null;
  driverName?: string;
  /** Style for the tappable phone number text */
  textStyle?: any;
  /** Use a compact pill look (trip cards) instead of plain text */
  pill?: boolean;
}

const MENU_WIDTH = 276;

/**
 * Tappable driver phone number. Opens a small popup menu next to the number with
 * "Find other trips by this driver" and quick filters (completed, cancelled, rejected).
 */
export default function DriverPhoneMenu({ phone, driverName, textStyle, pill }: Props) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const anchorRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  if (!phone || phone === '--' || phone.trim() === '') {
    return <Text style={textStyle}>--</Text>;
  }

  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const tenDigits = cleanPhone.replace(/\D/g, '').slice(-10);

  const open = () => {
    anchorRef.current?.measureInWindow((x, y, _w, h) => {
      const { width, height } = Dimensions.get('window');
      const menuHeight = 330;
      const left = Math.min(Math.max(12, x), width - MENU_WIDTH - 12);
      let top = y + h + 6;
      if (top + menuHeight > height - 20) {
        top = Math.max(40, y - menuHeight - 6);
      }
      setPos({ top, left });
      setVisible(true);
    });

    setCounts(null);
    setLoadingCounts(true);
    fetchTripsByDriver(tenDigits)
      .then((trips: any[]) => {
        const c: Record<string, number> = { all: trips.length, complete: 0, cancelledDriver: 0, cancelledPassenger: 0, rejected: 0 };
        trips.forEach((t) => {
          const s = getEffectiveTripStatus(t).toLowerCase();
          if (s.includes('complete')) c.complete += 1;
          else if (s.includes('cancel') && s.includes('driver')) c.cancelledDriver += 1;
          else if (s.includes('cancel')) c.cancelledPassenger += 1;
          else if (s.includes('reject')) c.rejected += 1;
        });
        setCounts(c);
      })
      .catch(() => setCounts(null))
      .finally(() => setLoadingCounts(false));
  };

  const close = () => setVisible(false);

  const goToTrips = (status: string) => {
    close();
    navigation.navigate('DriverTrips', { phone: tenDigits, driverName, initialStatus: status });
  };

  const Item = ({ icon, label, onPress, count, highlight }: { icon: string; label: string; onPress: () => void; count?: number; highlight?: boolean }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[styles.item, highlight && { backgroundColor: colors.tabActiveBg }]}
    >
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={[styles.itemLabel, { color: highlight ? colors.accent : colors.textPrimary }]} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined ? (
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{count}</Text>
      ) : loadingCounts && !highlight && label.includes('trips') ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          onPress={open}
          activeOpacity={0.7}
          style={
            pill
              ? [styles.pill, { backgroundColor: colors.tabActiveBg }]
              : { flexDirection: 'row', alignItems: 'center' }
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              textStyle,
              { color: colors.accent, fontWeight: '700', textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
            ]}
          >
            {phone}
          </Text>
          <Text style={{ color: colors.accent, fontSize: 10, marginLeft: 4 }}>▾</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable
            style={[styles.menu, { top: pos.top, left: pos.left, backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
            onPress={() => {}}
          >
            <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.menuTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {driverName || 'Driver'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{phone}</Text>
            </View>

            <Item highlight icon="🔎" label="Find other trips by this driver" count={counts?.all} onPress={() => goToTrips('all')} />
            <Item icon="✅" label="Completed trips" count={counts?.complete} onPress={() => goToTrips('PaymentComplete')} />
            <Item icon="🚫" label="Cancelled by driver" count={counts?.cancelledDriver} onPress={() => goToTrips('CancelledByDriver')} />
            <Item icon="↩️" label="Cancelled by passenger" count={counts?.cancelledPassenger} onPress={() => goToTrips('CancelledByPassenger')} />
            <Item icon="✋" label="Rejected trips" count={counts?.rejected} onPress={() => goToTrips('Rejected')} />

            <View style={[styles.sep, { backgroundColor: colors.border }]} />

            <Item
              icon="📞"
              label="Call driver"
              onPress={() => {
                close();
                Linking.openURL(`tel:${cleanPhone}`).catch(() => {});
              }}
            />
            <Item
              icon="📋"
              label="Copy number"
              onPress={() => {
                close();
                Clipboard.setString(tenDigits);
                Alert.alert('Copied', 'Phone number copied to clipboard');
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  backdrop: { flex: 1, backgroundColor: 'rgba(2,6,23,0.35)' },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: 18,
    padding: 6,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  menuHeader: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, marginBottom: 4 },
  menuTitle: { fontSize: 14, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, gap: 10 },
  itemIcon: { fontSize: 15, width: 22, textAlign: 'center' },
  itemLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  itemCount: { fontSize: 13, fontWeight: '600' },
  sep: { height: 1, marginHorizontal: 8, marginVertical: 4 },
});
