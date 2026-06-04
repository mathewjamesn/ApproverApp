import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';

const CopyableId = ({ value, textStyle }: { value?: string, textStyle: any }) => {
  if (!value) return <Text style={textStyle}>--</Text>;
  const shortId = value.length > 12 ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : value;

  const handleCopy = () => {
    Clipboard.setString(value);
    Alert.alert('Copied', 'ID copied to clipboard');
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={textStyle} selectable={true}>{shortId}</Text>
      <TouchableOpacity onPress={handleCopy} style={{ marginLeft: 6, padding: 2 }}>
        <Text style={{ fontSize: 16, includeFontPadding: false }}>📋</Text>
      </TouchableOpacity>
    </View>
  );
};

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
            <Text style={styles.label}>Trip ID</Text>
            <CopyableId value={tripData.id} textStyle={styles.value} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Request ID</Text>
            <CopyableId value={tripData.rideRequestIdentifier} textStyle={styles.value} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Created On</Text>
            <Text style={styles.value}>{new Date(tripData.createdOn).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Current Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{(tripData.tripStatus || '').replace(/([A-Z])/g, ' $1').trim()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route & Timeline</Text>
          <View style={styles.routeItem}>
            <Text style={{ fontSize: 16, includeFontPadding: false }}>🔵</Text>
            <Text style={styles.locText}>{tripData.fromLocation}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <Text style={{ fontSize: 16, includeFontPadding: false }}>🔴</Text>
            <Text style={styles.locText}>{tripData.toLocation}</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Distance</Text>
              <Text style={styles.value}>{tripData.distanceInKilometers} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>OTP</Text>
              <Text style={styles.value}>{tripData.otp}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Accepted</Text>
              <Text style={styles.value}>{tripData.tripAcceptDate || '--'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Started</Text>
              <Text style={styles.value}>{tripData.tripStartDate || '--'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ended</Text>
              <Text style={styles.value}>{tripData.tripEndDate || '--'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financials</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Initial Fare Estimate</Text>
            <Text style={styles.value}>₹{(tripData.initialFareAmount || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Final Fare Amount</Text>
            <Text style={[styles.value, { color: colors.accent, fontSize: 16 }]}>₹{(tripData.finalFareAmount || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Mode</Text>
            <Text style={styles.value}>{tripData.passengerOptedPaymentMode || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Driver Earnings</Text>
            <Text style={styles.value}>₹{(tripData.driverEarningsForTrip || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Platform Charges</Text>
            <Text style={styles.value}>₹{(tripData.totalPlatformCharges || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>GST Collected</Text>
            <Text style={styles.value}>₹{(tripData.gstCollectedForTrip || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{tripData.driverName || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{tripData.driverMobileNumber || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vehicle Type</Text>
            <Text style={styles.value}>{tripData.vehicleType || '--'} ({tripData.vehicleCategory || '--'})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Driver ID</Text>
            <CopyableId value={tripData.driverIdentifier} textStyle={styles.value} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passenger Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{tripData.passengerName || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{tripData.passengerMobileNumber || '--'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Passenger ID</Text>
            <CopyableId value={tripData.passengerIdentifier} textStyle={styles.value} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
