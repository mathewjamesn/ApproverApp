import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Linking, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { driverService, Driver } from '../../../services/api/driverService';

type FilterTab = 'PENDING' | 'REJECTED' | 'ADD_ON';

export default function DriversScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState<FilterTab>('PENDING');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [addonVehicles, setAddonVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search states
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDrivers = async (tabToFetch: FilterTab = activeTab, isRefreshCall?: boolean) => {
    if (!isRefreshCall) {
      setIsLoading(true);
      setDrivers([]);
      setAddonVehicles([]);
    }
    try {
      if (tabToFetch === 'PENDING') {
        const data = await driverService.getPendingDrivers();
        setDrivers(data);
      } else if (tabToFetch === 'REJECTED') {
        const data = await driverService.getRejectedDrivers();
        setDrivers(data);
      } else if (tabToFetch === 'ADD_ON') {
        const data = await driverService.getAddonPendingVehicles();
        setAddonVehicles(data);
      }
    } catch (error) {
      console.log('Error fetching drivers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: FilterTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    fetchDrivers(tab);
  };

  const resetAndFetchDrivers = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setActiveTab('PENDING');
    fetchDrivers('PENDING');
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Clear all values and fetch API whenever user comes to driver tab
      resetAndFetchDrivers();
    }, [resetAndFetchDrivers])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      resetAndFetchDrivers();
    });
    return unsubscribe;
  }, [navigation, resetAndFetchDrivers]);

  const handleSearch = async (queryToSearch?: string, isRefreshCall?: boolean) => {
    const query = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (query.length !== 10) return;
    if (!isRefreshCall) {
      setIsSearching(true);
      setSearchResults([]);
    }
    try {
      const data = await driverService.getActiveDriverByPhone(query);
      setSearchResults(data);
    } catch (error) {
      console.log('Error searching drivers', error);
    } finally {
      setIsSearching(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isSearchActive) {
        await fetchDrivers(activeTab, true);
      } else if (searchQuery.trim().length === 10) {
        await handleSearch(undefined, true);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length === 10) {
      const timer = setTimeout(() => {
        handleSearch(query);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const formatInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return colors.info;
      case 'REJECTED': return colors.danger;
      case 'ACTIVE':
      case 'APPROVED': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {isSearchActive ? (
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={{
                flex: 1,
                height: 40,
                backgroundColor: colors.inputBg,
                borderRadius: 20,
                paddingHorizontal: 16,
                fontSize: 14,
                color: colors.textPrimary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              placeholder="Search by phone number..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              keyboardType="phone-pad"
              onSubmitEditing={() => handleSearch()}
              autoFocus
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setIsSearchActive(false);
                setSearchQuery('');
                setSearchResults([]);
                fetchDrivers(activeTab);
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Drivers</Text>
              <Text style={styles.statsSubtitle}>
                {activeTab === 'PENDING'
                  ? `${drivers.length} Pending Verifications`
                  : activeTab === 'REJECTED'
                  ? `${drivers.length} Rejected Drivers`
                  : `${addonVehicles.length} Add-On Requests`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setIsSearchActive(true)}
            >
              <Text style={styles.searchIconText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isSearchActive && (
        <View style={styles.tabsContainer}>
          {(['PENDING', 'REJECTED', 'ADD_ON'] as FilterTab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'ADD_ON' ? 'Add-On' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {isSearchActive ? (
          isSearching ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {searchResults.map((driver, idx) => {
                const displayName = (driver.firstName || '') + " " + (driver.lastName || '') || 'N/A';
                const displayPhone = driver.mobileNumber || 'N/A';
                const displayStatus = driver.verificationStatus || driver.status || 'Unknown';

                return (
                  <TouchableOpacity
                    key={driver.id || idx.toString()}
                    style={styles.driverCard}
                    onPress={() => {
                      if (driver.verificationStatus !== 'Approved') {
                        (navigation.navigate as any)('DriverVerificationDetails', {
                          driverName: displayName,
                          status: displayStatus,
                          id: driver.id,
                          partitionKey: driver.partitionKey || 'Kerala'
                        });
                      } else {
                        (navigation.navigate as any)('DriverDetails', {
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                            <Text style={styles.driverPhone}>{displayPhone}</Text>
                            {displayPhone !== 'N/A' && displayPhone !== '--' && (
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                  onPress={() => {
                                    const cleanPhone = displayPhone.replace(/[^\d+]/g, '');
                                    Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                                  }}
                                  style={{ padding: 4 }}
                                >
                                  <Text style={{ fontSize: 16 }}>📞</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => {
                                    const cleanPhone = displayPhone.replace(/[^\d+]/g, '');
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
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(displayStatus) + '1A' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(displayStatus) }]}>
                          {displayStatus}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {searchResults.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: colors.textSecondary }}>
                    {searchQuery.trim().length === 0 ? 'Enter a phone number to search.' : 'No driver found.'}
                  </Text>
                </View>
              )}
            </>
          )
        ) : (
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : activeTab === 'ADD_ON' ? (
            <>
              {addonVehicles.map((vehicle, idx) => (
                <TouchableOpacity
                  key={vehicle.id || idx.toString()}
                  style={styles.driverCard}
                  onPress={() => {
                    (navigation.navigate as any)('AddOnDetails', { vehicle });
                  }}
                >
                  <View style={styles.driverCardContent}>
                    <View style={styles.driverInfo}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={{ fontSize: 22 }}>🚗</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.driverName}>{vehicle.registrationNumber || 'N/A'}</Text>
                        <Text style={styles.driverPhone}>
                          {[vehicle.vehicleMake, vehicle.vehicleModel].filter(Boolean).join(' ') || 'N/A'}
                        </Text>
                        <Text style={[styles.driverPhone, { marginTop: 2 }]}>
                          {vehicle.category || vehicle.vehicleType || 'N/A'} · {vehicle.colour || ''}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: colors.info + '1A' }]}>
                      <Text style={[styles.statusText, { color: colors.info }]}>Pending</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {addonVehicles.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: colors.textSecondary }}>No Add-On requests found.</Text>
                </View>
              )}
            </>
          ) : (
            <>
              {drivers.map((driver, idx) => {
                const displayName = (driver.firstName || '') + " " + (driver.lastName || '') || 'N/A';
                const displayPhone = driver.mobileNumber || 'N/A';
                const displayStatus = driver.status || activeTab;

                return (
                  <TouchableOpacity
                    key={driver.id || idx.toString()}
                    style={styles.driverCard}
                    onPress={() => {
                      (navigation.navigate as any)('DriverVerificationDetails', {
                        driverName: displayName,
                        status: displayStatus,
                        id: driver.id,
                        partitionKey: driver.partitionKey || 'Kerala'
                      });
                    }}
                  >
                    <View style={styles.driverCardContent}>
                      <View style={styles.driverInfo}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>{formatInitials(displayName)}</Text>
                        </View>
                        <View>
                          <Text style={styles.driverName}>{displayName}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                            <Text style={styles.driverPhone}>{displayPhone}</Text>
                            {displayPhone !== 'N/A' && displayPhone !== '--' && (
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                  onPress={() => {
                                    const cleanPhone = displayPhone.replace(/[^\d+]/g, '');
                                    Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                                  }}
                                  style={{ padding: 4 }}
                                >
                                  <Text style={{ fontSize: 16 }}>📞</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => {
                                    const cleanPhone = displayPhone.replace(/[^\d+]/g, '');
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
                );
              })}
              {drivers.length === 0 && (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: colors.textSecondary }}>
                    No drivers found in this category.
                  </Text>
                </View>
              )}
            </>
          )
        )}
      </ScrollView>
    </View>
  );
}
