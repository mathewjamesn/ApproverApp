import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Linking, StatusBar } from 'react-native';
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

  const formatStatusDisplay = (status?: string) => {
    return status || 'Unknown';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return colors.textSecondary;
    const s = status.toLowerCase();
    if (s.includes('complete') || s === 'paymentcomplete') {
      return colors.success;
    }
    if (s.includes('driver') && s.includes('cancel')) {
      return '#E11D48'; // Vivid Red / Rose (Cancelled by Driver)
    }
    if ((s.includes('passenger') || s.includes('customer')) && s.includes('cancel')) {
      return '#F97316'; // Amber / Orange (Cancelled by Passenger)
    }
    if (s.includes('cancel') || s.includes('reject')) {
      return colors.danger;
    }
    if (s.includes('start')) {
      return colors.info;
    }
    if (s.includes('accept')) {
      return colors.accent;
    }
    return colors.textSecondary;
  };

  const statusColor = getStatusColor(tripData.tripStatus);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={[styles.header, { paddingTop: (insets.top || 0) + 16 }]}>
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
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A', borderColor: statusColor + '33', borderWidth: 1 }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{formatStatusDisplay(tripData.tripStatus)}</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.value}>{tripData.driverMobileNumber || '--'}</Text>
              {tripData.driverMobileNumber && tripData.driverMobileNumber !== '--' && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.driverMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.driverMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.value}>{tripData.passengerMobileNumber || '--'}</Text>
              {tripData.passengerMobileNumber && tripData.passengerMobileNumber !== '--' && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.passengerMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = tripData.passengerMobileNumber.replace(/[^\d+]/g, '');
                      Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Passenger ID</Text>
            <CopyableId value={tripData.passengerIdentifier} textStyle={styles.value} />
          </View>
        </View>
      </ScrollView>

      {(tripData.tripStatus === 'PaymentComplete' || tripData.tripStatus === 'completed') && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            margin: 16,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
          onPress={() => {
            const fromLat = tripData.fromAddress?.latitude;
            const fromLng = tripData.fromAddress?.longitude;
            const toLat = tripData.toAddress?.latitude;
            const toLng = tripData.toAddress?.longitude;
            const origin = (fromLat && fromLng) ? `${fromLat},${fromLng}` : encodeURIComponent(tripData.fromLocation || '');
            const dest = (toLat && toLng) ? `${toLat},${toLng}` : encodeURIComponent(tripData.toLocation || '');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
            Linking.openURL(url);
          }}
        >
          <Text style={{ fontSize: 20 }}>🗺️</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Route Info</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
