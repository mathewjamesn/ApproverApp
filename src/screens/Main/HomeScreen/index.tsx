import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { reportsService, RegistrationSummary, RegistrationObject, RecentlyCompletedTripsData, CompletedTripDayReport } from '../../../services/api/reportsService';
import { passengerService } from '../../../services/api/passengerService';
import { useEnvironment } from '../../../context/EnvironmentContext';

const TRIP_DAYS_OPTIONS = [1, 2, 5, 10];

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { environment } = useEnvironment();
  const styles = getStyles(colors);

  const [activeCategory, setActiveCategory] = useState<'DRIVER' | 'PASSENGER' | 'TRIPS'>('DRIVER');
  const [registrationData, setRegistrationData] = useState<RegistrationObject | null>(null);
  const [selectedTripDays, setSelectedTripDays] = useState<number>(5);
  const [tripsReportData, setTripsReportData] = useState<RecentlyCompletedTripsData | null>(null);
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const fetchReportsData = async (cat: 'DRIVER' | 'PASSENGER' | 'TRIPS') => {
    setIsReportsLoading(true);
    try {
      if (cat === 'DRIVER') {
        const summaryResponse = await reportsService.getDriverRegistrationSummary();
        const summary = summaryResponse?.find((item) => item.state === "Kerala");
        if (summary) setRegistrationData(summary);
      } else if (cat === 'PASSENGER') {
        let passengerCount = 0;
        try {
          passengerCount = await passengerService.getPassengerCount();
        } catch (e) {
          console.log('Error getting passenger count', e);
        }
        setRegistrationData({
          totalRegistered: passengerCount,
          approved: 0,
          pendingVerification: 0,
          documentPending: 0,
          rejected: 0,
          state: 'Kerala',
        });
      } else if (cat === 'TRIPS') {
        try {
          const tripsData = await reportsService.getRecentlyCompletedTripsReport(selectedTripDays);
          setTripsReportData(tripsData);
        } catch (e) {
          console.log('Error getting trips report', e);
        }
      }
    } catch (error) {
      console.log('Error loading registration summary:', error);
    } finally {
      setIsReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData(activeCategory);
  }, [activeCategory, selectedTripDays]);

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

  const getCategoryConfig = (cat: 'DRIVER' | 'PASSENGER' | 'TRIPS') => {
    switch (cat) {
      case 'DRIVER':
        return {
          title: 'Driver Registration Summary',
          approvedLabel: 'Approved Drivers',
          pendingLabel: 'Pending Verification',
          docLabel: 'Document Pending',
          rejectedLabel: 'Rejected',
        };
      case 'PASSENGER':
        return {
          title: 'Passenger Registration Summary',
          approvedLabel: 'Approved Passengers',
          pendingLabel: 'Pending Verification',
          docLabel: 'Verification Incomplete',
          rejectedLabel: 'Suspended / Rejected',
        };
      case 'TRIPS':
        return {
          title: 'Trips Summary',
          approvedLabel: 'Completed Trips',
          pendingLabel: 'In-Progress Trips',
          docLabel: 'Scheduled / Booked',
          rejectedLabel: 'Cancelled Trips',
        };
    }
  };

  const config = getCategoryConfig(activeCategory);

  const approvedCount = Math.round(registrationData?.approved || 0);
  const pendingCount = Math.round(registrationData?.pendingVerification || 0);
  const docCount = Math.round(registrationData?.documentPending || 0);
  const rejectedCount = Math.round(registrationData?.rejected || 0);
  const total = registrationData?.totalRegistered || 1;
  const othersCount = Math.max(0, total - approvedCount - pendingCount - docCount - rejectedCount);

  const approvedPercent = ((approvedCount / total) * 100);
  const pendingPercent = ((pendingCount / total) * 100);
  const docPercent = ((docCount / total) * 100);
  const rejectedPercent = ((rejectedCount / total) * 100);
  const othersPercent = ((othersCount / total) * 100);

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
              <View style={styles.environmentBadge}>
                <Text style={styles.environmentBadgeText}>{environment}</Text>
              </View>
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
              <TouchableOpacity
                key={item.id}
                style={styles.qaCard}
                onPress={() => {
                  if (item.title === 'Trips') {
                    navigation.navigate('Trips' as never);
                  } else if (item.title === 'Drivers') {
                    navigation.navigate('Drivers' as never);
                  } else if (item.title === 'Passengers') {
                    navigation.navigate('Passengers' as never);
                  } else if (item.title === 'Get OTP') {
                    navigation.navigate('GetOTP' as never);
                  } else if (item.title === 'Airport Multiplier') {
                    navigation.navigate('AirportFareMultiplier' as never);
                  } else if (item.title === 'Fare Multiplier') {
                    navigation.navigate('FareMultiplier' as never);
                  } else if (item.title === 'Send Notification') {
                    navigation.navigate('SendNotification' as never);
                  }
                }}
              >
                <View style={[styles.qaIconContainer, { backgroundColor: item.bgColor }]}>
                  <Text style={styles.qaIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.qaText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              Reports & Statistics
            </Text>
            <TouchableOpacity
              onPress={() => fetchReportsData(activeCategory)}
              disabled={isReportsLoading}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.tabActiveBg,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {isReportsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ fontSize: 14, includeFontPadding: false }}>🔄</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={[styles.categoryCard, activeCategory === 'DRIVER' && styles.categoryCardActive]}
              onPress={() => setActiveCategory('DRIVER')}
            >
              <Text style={styles.categoryIcon}>📊</Text>
              <Text style={[styles.categoryTitle, activeCategory === 'DRIVER' && styles.categoryTitleActive]}>Driver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, activeCategory === 'PASSENGER' && styles.categoryCardActive]}
              onPress={() => setActiveCategory('PASSENGER')}
            >
              <Text style={styles.categoryIcon}>📈</Text>
              <Text style={[styles.categoryTitle, activeCategory === 'PASSENGER' && styles.categoryTitleActive]}>Passenger</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryCard, activeCategory === 'TRIPS' && styles.categoryCardActive]}
              onPress={() => setActiveCategory('TRIPS')}
            >
              <Text style={styles.categoryIcon}>📋</Text>
              <Text style={[styles.categoryTitle, activeCategory === 'TRIPS' && styles.categoryTitleActive]}>Trips</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>
              {activeCategory === 'TRIPS'
                ? 'Completed Trips Report'
                : activeCategory === 'PASSENGER'
                ? 'Passenger Summary'
                : 'Driver Registration Summary'}
            </Text>

            {isReportsLoading ? (
              <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : activeCategory === 'TRIPS' ? (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.chartLabel}>Select Days Range</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {TRIP_DAYS_OPTIONS.map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: selectedTripDays === days ? colors.primary : colors.inputBg,
                          borderWidth: 1,
                          borderColor: selectedTripDays === days ? colors.primary : colors.border,
                        }}
                        onPress={() => setSelectedTripDays(days)}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: selectedTripDays === days ? '#FFFFFF' : colors.textPrimary,
                          }}
                        >
                          {days === 1 ? '1 Day' : `${days} Days`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.totalBanner}>
                  <Text style={styles.totalLabel}>
                    Total Completed Trips ({selectedTripDays === 1 ? 'Last 1 Day' : `Last ${selectedTripDays} Days`})
                  </Text>
                  <Text style={styles.totalValue}>{tripsReportData?.total ?? 0}</Text>
                </View>

                {/* Graphical Representation: Vertical Bar Chart */}
                {tripsReportData?.daily && tripsReportData.daily.length > 0 && (() => {
                  const maxVal = Math.max(...tripsReportData.daily.map(d => d.count), 1);
                  return (
                    <View
                      style={{
                        marginVertical: 16,
                        padding: 16,
                        backgroundColor: colors.inputBg,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={[styles.chartLabel, { marginBottom: 16 }]}>📊 Completed Trips Trend</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                          flexGrow: 1,
                          justifyContent: 'space-around',
                          alignItems: 'flex-end',
                          height: 150,
                          paddingTop: 20,
                          paddingBottom: 4,
                        }}
                      >
                        {tripsReportData.daily.map((item, index) => {
                          const heightPercent = Math.max(12, Math.round((item.count / maxVal) * 100));
                          return (
                            <View
                              key={index}
                              style={{
                                alignItems: 'center',
                                width: Math.max(52, 280 / tripsReportData.daily.length),
                                marginHorizontal: 4,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: '700',
                                  color: colors.primary,
                                  marginBottom: 6,
                                }}
                              >
                                {item.count}
                              </Text>
                              <View
                                style={{
                                  width: '55%',
                                  maxWidth: 24,
                                  minWidth: 14,
                                  height: `${heightPercent}%`,
                                  backgroundColor: colors.primary,
                                  borderTopLeftRadius: 6,
                                  borderTopRightRadius: 6,
                                  shadowColor: colors.primary,
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 4,
                                  elevation: 3,
                                }}
                              />
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 10,
                                  color: colors.textSecondary,
                                  marginTop: 8,
                                  fontWeight: '500',
                                  textAlign: 'center',
                                }}
                              >
                                {item.date}
                              </Text>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  );
                })()}

                <View style={styles.statsTable}>
                  <Text style={[styles.chartLabel, { marginBottom: 12 }]}>Day-wise Breakdown Details</Text>
                  {tripsReportData?.daily && tripsReportData.daily.length > 0 ? (
                    tripsReportData.daily.map((item, index) => {
                      const isLast = index === tripsReportData.daily.length - 1;
                      return (
                        <View key={index} style={isLast ? styles.statsRowLast : styles.statsRow}>
                          <View style={styles.legendMarkerGroup}>
                            <Text style={{ fontSize: 14, marginRight: 6 }}>📅</Text>
                            <Text style={styles.legendLabel}>{item.date}</Text>
                          </View>
                          <View style={styles.statsValues}>
                            <Text style={[styles.statsCount, { color: colors.primary }]}>{item.count} trips</Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                      <Text style={{ color: colors.textSecondary }}>No completed trip data for the selected period.</Text>
                    </View>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.totalBanner}>
                  <Text style={styles.totalLabel}>
                    {activeCategory === 'PASSENGER' ? 'Total Passengers' : 'Total Registered'}
                  </Text>
                  <Text style={styles.totalValue}>{total}</Text>
                </View>

                {activeCategory === 'DRIVER' && (
                  <>
                    <View style={styles.chartContainer}>
                      <Text style={styles.chartLabel}>Registration Proportion</Text>
                      <View style={styles.stackedBar}>
                        {approvedPercent > 0 && (
                          <View style={[styles.barSegment, { width: `${approvedPercent}%`, backgroundColor: colors.success }]} />
                        )}
                        {pendingPercent > 0 && (
                          <View style={[styles.barSegment, { width: `${pendingPercent}%`, backgroundColor: colors.info }]} />
                        )}
                        {docPercent > 0 && (
                          <View style={[styles.barSegment, { width: `${docPercent}%`, backgroundColor: colors.accent }]} />
                        )}
                        {rejectedPercent > 0 && (
                          <View style={[styles.barSegment, { width: `${rejectedPercent}%`, backgroundColor: colors.danger }]} />
                        )}
                        {othersPercent > 0 && (
                          <View style={[styles.barSegment, { width: `${othersPercent}%`, backgroundColor: colors.border }]} />
                        )}
                      </View>
                    </View>

                    <View style={styles.statsTable}>
                      <View style={styles.statsRow}>
                        <View style={styles.legendMarkerGroup}>
                          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                          <Text style={styles.legendLabel}>{config.approvedLabel}</Text>
                        </View>
                        <View style={styles.statsValues}>
                          <Text style={styles.statsCount}>{approvedCount}</Text>
                          <Text style={styles.statsPercent}>{approvedPercent.toFixed(1)}%</Text>
                        </View>
                      </View>

                      <View style={styles.statsRow}>
                        <View style={styles.legendMarkerGroup}>
                          <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
                          <Text style={styles.legendLabel}>{config.pendingLabel}</Text>
                        </View>
                        <View style={styles.statsValues}>
                          <Text style={styles.statsCount}>{pendingCount}</Text>
                          <Text style={styles.statsPercent}>{pendingPercent.toFixed(1)}%</Text>
                        </View>
                      </View>

                      <View style={styles.statsRow}>
                        <View style={styles.legendMarkerGroup}>
                          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                          <Text style={styles.legendLabel}>{config.docLabel}</Text>
                        </View>
                        <View style={styles.statsValues}>
                          <Text style={styles.statsCount}>{docCount}</Text>
                          <Text style={styles.statsPercent}>{docPercent.toFixed(1)}%</Text>
                        </View>
                      </View>

                      <View style={styles.statsRow}>
                        <View style={styles.legendMarkerGroup}>
                          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                          <Text style={styles.legendLabel}>{config.rejectedLabel}</Text>
                        </View>
                        <View style={styles.statsValues}>
                          <Text style={styles.statsCount}>{rejectedCount}</Text>
                          <Text style={styles.statsPercent}>{rejectedPercent.toFixed(1)}%</Text>
                        </View>
                      </View>

                      <View style={styles.statsRowLast}>
                        <View style={styles.legendMarkerGroup}>
                          <View style={[styles.legendDot, { backgroundColor: colors.border }]} />
                          <Text style={styles.legendLabel}>Incomplete / Draft</Text>
                        </View>
                        <View style={styles.statsValues}>
                          <Text style={styles.statsCount}>{othersCount}</Text>
                          <Text style={styles.statsPercent}>{othersPercent.toFixed(1)}%</Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}
