import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function ScreenHeader({ title, subtitle, onBack, onRefresh, refreshing }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: (insets.top || 0) + 14 }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <TouchableOpacity style={styles.btn} onPress={onBack}>
        <Text style={{ color: colors.primaryText, fontSize: 18 }}>←</Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.sub, { color: colors.primaryText }]} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {onRefresh ? (
        <TouchableOpacity style={styles.btn} onPress={onRefresh} disabled={refreshing}>
          {refreshing ? <ActivityIndicator size="small" color={colors.primaryText} /> : <Text style={{ fontSize: 16 }}>🔄</Text>}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  btn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 19, fontWeight: '700' },
  sub: { fontSize: 12, opacity: 0.8, marginTop: 1 },
});
