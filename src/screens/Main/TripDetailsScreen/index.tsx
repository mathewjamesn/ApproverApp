import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';

export default function TripDetailsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const { tripData } = route.params || {};

  if (!tripData) return <View style={styles.container}><Text>No data</Text></View>;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trip Record Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Trip Request ID</Text>
            <Text style={styles.value}>{tripData.id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Timestamp</Text>
            <Text style={styles.value}>{new Date(tripData.date).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{tripData.status.replace('_', ' ')}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Fare Estimate</Text>
            <Text style={[styles.value, { color: colors.accent, fontSize: 16 }]}>{tripData.fare}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Timeline</Text>
          <View style={styles.routeItem}>
             <Text style={{ fontSize: 16, includeFontPadding: false }}>🔵</Text>
             <Text style={styles.locText}>{tripData.pickup}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
             <Text style={{ fontSize: 16, includeFontPadding: false }}>🔴</Text>
             <Text style={styles.locText}>{tripData.dropoff}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entities Involved</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Assigned Driver ID</Text>
            <Text style={styles.value}>{tripData.driverId || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Passenger Match ID</Text>
            <Text style={styles.value}>{tripData.passengerId || '--'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
