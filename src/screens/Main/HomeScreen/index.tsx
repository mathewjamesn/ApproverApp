import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const QA_DATA = [
    { id: '1', title: 'Trips', icon: '📑', bgColor: colors.tabActiveBg },
    { id: '2', title: 'Drivers', icon: '🧑‍✈️', bgColor: colors.inputBg },
    { id: '3', title: 'Passengers', icon: '👥', bgColor: colors.tabActiveBg },
    { id: '4', title: 'App Statistics', icon: '📊', bgColor: colors.border },
    { id: '5', title: 'Get OTP', icon: '📱', bgColor: colors.inputBg },
    { id: '6', title: 'Send Notification', icon: '📤', bgColor: colors.tabActiveBg },
    { id: '7', title: 'Fare Multiplier', icon: '🎛️', bgColor: colors.border },
    { id: '8', title: 'Airport Multiplier', icon: '✈️', bgColor: colors.inputBg },
    { id: '9', title: 'Rate Per KM', icon: '🔀', bgColor: colors.tabActiveBg },
  ];

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollView}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingTitle}>
                Hello, Admin <Text>👋</Text>
              </Text>
              <Text style={styles.greetingSubtitle}>Welcome back!</Text>
            </View>
            <TouchableOpacity style={styles.notificationIcon}>
              <Text style={{ fontSize: 24, includeFontPadding: false }}>🔔</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <View style={styles.qaGrid}>
            {QA_DATA.map((item) => (
              <TouchableOpacity key={item.id} style={styles.qaCard}>
                <View style={[styles.qaIconContainer, { backgroundColor: item.bgColor }]}>
                  <Text style={styles.qaIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.qaText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
            Today's Overview
          </Text>
          
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>Total Trips</Text>
              <Text style={styles.overviewValue}>128</Text>
              <Text style={styles.overviewSubtitlePos}>↑ 12.5%</Text>
            </View>

            <View style={styles.overviewCard}>
              <View style={styles.overviewCardHeaderRow}>
                <Text style={styles.overviewTitle}>Completed</Text>
                <Text style={styles.cardChevron}>›</Text>
              </View>
              <Text style={styles.overviewValue}>96</Text>
              <Text style={styles.overviewSubtitlePos}>↑ 8.3%</Text>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>Drivers</Text>
              <Text style={styles.overviewValue}>74</Text>
              <Text style={styles.overviewSubtitlePos}>Active</Text>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>Passengers</Text>
              <Text style={styles.overviewValue}>156</Text>
              <Text style={styles.overviewSubtitlePos}>Active</Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}
