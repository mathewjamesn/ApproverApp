import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { driverService, Driver } from '../../../services/api/driverService';

type FilterTab = 'PENDING' | 'REJECTED' | 'ACTIVE';

export default function DriversScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState<FilterTab>('PENDING');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDrivers = async () => {
    setIsLoading(true);
    setDrivers([]);
    try {
      if (activeTab === 'PENDING') {
        const data = await driverService.getPendingDrivers();
        setDrivers(data);
      } else if (activeTab === 'REJECTED') {
        const data = await driverService.getRejectedDrivers();
        setDrivers(data);
      } else if (activeTab === 'ACTIVE') {
        if (searchQuery.trim().length > 0) {
          const data = await driverService.getActiveDriverByPhone(searchQuery.trim());
          setDrivers(data);
        } else {
          setDrivers([]);
        }
      }
    } catch (error) {
      console.log('Error fetching drivers', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'ACTIVE') {
      fetchDrivers();
    } else if (activeTab === 'ACTIVE' && searchQuery.trim().length === 0) {
      setDrivers([]);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      // Refresh data whenever screen gains focus
      if (activeTab !== 'ACTIVE') {
        fetchDrivers();
      } else if (activeTab === 'ACTIVE' && searchQuery.trim().length > 0) {
        fetchDrivers();
      } else if (activeTab === 'ACTIVE' && searchQuery.trim().length === 0) {
        setDrivers([]);
      }
      // No cleanup needed
    }, [activeTab])
  );

  const handleSearch = () => {
    if (activeTab === 'ACTIVE' && searchQuery.trim().length > 0) {
      fetchDrivers();
    }
  };

  const formatInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return colors.info;
      case 'REJECTED': return colors.danger;
      case 'ACTIVE': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <Text style={styles.headerTitle}>Drivers</Text>
        <Text style={styles.statsSubtitle}>
          {activeTab === 'ACTIVE' ? 'Active Drivers' : `${drivers.length} ${activeTab === 'PENDING' ? 'Pending Verifications' : 'Rejected Drivers'}`}
        </Text>
      </View>

      <View style={styles.tabsContainer}>
        {(['PENDING', 'REJECTED', 'ACTIVE'] as FilterTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'ACTIVE' && (
        <View style={{ paddingHorizontal: 16, marginVertical: 16, flexDirection: 'row', gap: 10 }}>
          <TextInput
            style={{
              flex: 1,
              height: 48,
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder="Search by phone number..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="phone-pad"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              justifyContent: 'center',
              paddingHorizontal: 10,
              borderRadius: 12
            }}
            onPress={handleSearch}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {drivers.map((driver, idx) => {
              const displayName = driver.firstName + " " + driver.lastName || 'N/A';
              const displayPhone = driver.mobileNumber || 'N/A';
              const displayStatus = activeTab;

              return (
                <TouchableOpacity
                  key={driver.id || idx.toString()}
                  style={styles.driverCard}
                  onPress={() => {
                    if (activeTab === 'ACTIVE') {
                      (navigation.navigate as any)('DriverDetails', {
                        driverName: displayName,
                        status: displayStatus,
                        id: driver.id,
                        partitionKey: driver.partitionKey || 'Kerala'
                      });
                    } else {
                      (navigation.navigate as any)('DriverVerificationDetails', {
                        driverName: displayName,
                        status: displayStatus,
                        id: driver.id,
                        partitionKey: driver.partitionKey || 'Kerala'
                      });
                    }
                  }}
                >
                  <View style={styles.driverCardContent}>
                    <View style={styles.driverInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{formatInitials(displayName)}</Text>
                      </View>
                      <View>
                        <Text style={styles.driverName}>{displayName}</Text>
                        <Text style={styles.driverPhone}>{displayPhone}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayStatus) + '1A' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>
                        {displayStatus}
                      </Text>
                    </View>
                  </View>

                  {activeTab === 'PENDING' && (
                    <View style={styles.driverCardActions}>
                      <TouchableOpacity style={[styles.inlineActionBtn, styles.inlineActionBtnReject]}>
                        <Text style={styles.inlineActionBtnText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.inlineActionBtn, styles.inlineActionBtnApprove]}>
                        <Text style={styles.inlineActionBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
            {drivers.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: colors.textSecondary }}>
                  {activeTab === 'ACTIVE'
                    ? (searchQuery.trim().length === 0 ? 'Enter a phone number to search.' : 'No active driver found.')
                    : 'No drivers found in this category.'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
