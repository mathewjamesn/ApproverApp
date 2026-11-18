import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { useEnvironment } from '../../../context/EnvironmentContext';

interface Tile {
  title: string;
  icon: string;
  route: string;
  params?: Record<string, any>;
}

interface Section {
  title: string;
  tiles: Tile[];
}

const SECTIONS: Section[] = [
  {
    title: 'Approvals',
    tiles: [
      { title: 'Pending Drivers', icon: '🕒', route: 'Drivers', params: { tab: 'PENDING' } },
      { title: 'Vehicle Add-on', icon: '🚗', route: 'Drivers', params: { tab: 'ADD_ON' } },
      { title: 'Rejected Drivers', icon: '🚫', route: 'Drivers', params: { tab: 'REJECTED' } },
    ],
  },
  {
    title: 'Operations',
    tiles: [
      { title: 'Live Map', icon: '🗺️', route: 'LiveMap' },
      { title: 'Trips', icon: '📑', route: 'Trips' },
      { title: 'Drivers', icon: '🧑‍✈️', route: 'Drivers' },
      { title: 'Passengers', icon: '👥', route: 'Passengers' },
    ],
  },
  {
    title: 'Insights',
    tiles: [
      { title: 'Online by City', icon: '🏙️', route: 'OnlineDriversByCity' },
      { title: 'Top Online Drivers', icon: '🏆', route: 'TopOnlineDrivers' },
      { title: 'Reports', icon: '📊', route: 'Reports' },
      { title: 'Missed Requests', icon: '⚠️', route: 'MissedRequests' },
    ],
  },
  {
    title: 'Tools',
    tiles: [
      { title: 'Get OTP', icon: '🔑', route: 'GetOTP' },
      { title: 'Fare Multiplier', icon: '🎛️', route: 'FareMultiplier' },
      { title: 'Airport Multiplier', icon: '✈️', route: 'AirportFareMultiplier' },
      { title: 'Send Notification', icon: '📤', route: 'SendNotification' },
    ],
  },
];

const LIME = '#C6F68D';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { environment } = useEnvironment();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={[s.header, { paddingTop: insets.top + 24 }]}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.greet}>
              {greeting} · {today}
            </Text>
            <Text style={s.hello}>Hello, Admin</Text>
          </View>
          <View style={s.env}>
            <Text style={s.envText}>{environment}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 24 }}
      >
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 16 }}>
            <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={s.grid}>
              {section.tiles.map((tile) => (
                <TouchableOpacity
                  key={tile.title}
                  activeOpacity={0.8}
                  style={[s.tile, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate(tile.route, tile.params)}
                >
                  <View style={[s.iconWrap, { backgroundColor: colors.tabActiveBg }]}>
                    <Text style={s.icon}>{tile.icon}</Text>
                  </View>
                  <Text style={[s.tileText, { color: colors.textPrimary }]} numberOfLines={2}>
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

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    backgroundColor: '#000',
    paddingHorizontal: 18,
    paddingBottom: 26,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  greet: { color: '#B5B5B5', fontSize: 13, fontWeight: '600' },
  hello: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 2 },
  env: { backgroundColor: LIME, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  envText: { color: '#000', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '22.5%',
    flexGrow: 1,
    minWidth: 76,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 18,
    borderWidth: 1,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  icon: { fontSize: 22 },
  tileText: { fontSize: 11.5, fontWeight: '700', textAlign: 'center' },
});
