import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { useEnvironment } from '../../../context/EnvironmentContext';

interface Tile {
  title: string;
  icon: string;
  route: string;
  tint: string;
  badge?: string;
}

interface Section {
  title: string;
  tiles: Tile[];
}

const SECTIONS: Section[] = [
  {
    title: 'Operations',
    tiles: [
      { title: 'Live Map', icon: '🗺️', route: 'LiveMap', tint: '#0B6A96', badge: 'NEW' },
      { title: 'Trips', icon: '📑', route: 'Trips', tint: '#3B82F6' },
      { title: 'Drivers', icon: '🧑‍✈️', route: 'Drivers', tint: '#10B981' },
      { title: 'Passengers', icon: '👥', route: 'Passengers', tint: '#8B5CF6' },
    ],
  },
  {
    title: 'Insights',
    tiles: [
      { title: 'Online by City', icon: '🏙️', route: 'OnlineDriversByCity', tint: '#14B8A6', badge: 'NEW' },
      { title: 'Top Online Drivers', icon: '🏆', route: 'TopOnlineDrivers', tint: '#F59E0B', badge: 'NEW' },
      { title: 'Reports', icon: '📊', route: 'Reports', tint: '#0EA5E9' },
      { title: 'Missed Requests', icon: '⚠️', route: 'MissedRequests', tint: '#EF4444', badge: 'NEW' },
    ],
  },
  {
    title: 'Tools',
    tiles: [
      { title: 'Get OTP', icon: '📱', route: 'GetOTP', tint: '#6366F1' },
      { title: 'Fare Multiplier', icon: '🎛️', route: 'FareMultiplier', tint: '#F97316' },
      { title: 'Airport Multiplier', icon: '✈️', route: 'AirportFareMultiplier', tint: '#06B6D4' },
      { title: 'Send Notification', icon: '📤', route: 'SendNotification', tint: '#EC4899' },
    ],
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { environment } = useEnvironment();
  const styles = getStyles(colors);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 28 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingTitle}>Hello, Admin 👋</Text>
            <Text style={styles.greetingSubtitle}>What would you like to check today?</Text>
          </View>
          <View style={styles.environmentBadge}>
            <Text style={styles.environmentBadgeText}>{environment}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={[styles.scrollView, local.sheet, { backgroundColor: colors.background }]} bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 18 }}>
            <Text style={[local.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={local.grid}>
              {section.tiles.map((tile) => (
                <TouchableOpacity
                  key={tile.title}
                  activeOpacity={0.8}
                  style={[local.tile, { backgroundColor: colors.card, shadowColor: colors.cardShadow }]}
                  onPress={() => navigation.navigate(tile.route)}
                >
                  {tile.badge ? (
                    <View style={[local.badge, { backgroundColor: colors.accent }]}>
                      <Text style={local.badgeText}>{tile.badge}</Text>
                    </View>
                  ) : null}
                  <View style={[local.iconWrap, { backgroundColor: tile.tint + '22' }]}>
                    <Text style={local.icon}>{tile.icon}</Text>
                  </View>
                  <Text style={[local.tileText, { color: colors.textPrimary }]} numberOfLines={2}>
                    {tile.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const local = StyleSheet.create({
  sheet: { marginTop: -16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginLeft: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '23%',
    flexGrow: 1,
    minWidth: 76,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  icon: { fontSize: 22 },
  tileText: { fontSize: 11.5, fontWeight: '600', textAlign: 'center' },
  badge: { position: 'absolute', top: 6, right: 6, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },
});
