import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, Linking, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from './styles';
import { driverService } from '../../../services/api/driverService';
import DatePicker from 'react-native-date-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function DriverVerificationDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const driverName = (route.params as any)?.driverName || 'Unknown Driver';
  const driverId = (route.params as any)?.id;
  const partitionKey = (route.params as any)?.partitionKey || 'Kerala';

  const [isLoading, setIsLoading] = useState(true);
  const [driverDetails, setDriverDetails] = useState<any>(null);
  const [driverDocuments, setDriverDocuments] = useState<any>(null);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);

  const [licenseExpiryDate, setLicenseExpiryDate] = useState<Date | null>(null);
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState<Date | null>(null);
  const [permitExpiryDate, setPermitExpiryDate] = useState<Date | null>(null);

  const [openLicensePicker, setOpenLicensePicker] = useState(false);
  const [openInsurancePicker, setOpenInsurancePicker] = useState(false);
  const [openPermitPicker, setOpenPermitPicker] = useState(false);

  const [profileStatus, setProfileStatus] = useState<ReviewStatus>('PENDING');
  const [licenseStatus, setLicenseStatus] = useState<ReviewStatus>('PENDING');
  const [vehicleStatus, setVehicleStatus] = useState<ReviewStatus>('PENDING');

  const [profileReason, setProfileReason] = useState<string>('');
  const [licenseReason, setLicenseReason] = useState<string>('');
  const [vehicleReason, setVehicleReason] = useState<string>('');

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [localImages, setLocalImages] = useState<{ profile: string | null, license: string | null, vehicle: string | null }>({ profile: null, license: null, vehicle: null });
  const [fullScreenImageURI, setFullScreenImageURI] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  // Edit mode toggles
  const [isLicenseEditing, setIsLicenseEditing] = useState(false);
  const [isVehicleEditing, setIsVehicleEditing] = useState(false);

  // Editable license fields
  const [editLicenseNo, setEditLicenseNo] = useState<string>('');

  // Editable vehicle fields
  const [editPlateNo, setEditPlateNo] = useState<string>('');
  const [editVehicleName, setEditVehicleName] = useState<string>('');
  const [editVehicleMake, setEditVehicleMake] = useState<string>('');
  const [editVehicleType, setEditVehicleType] = useState<string>('');

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    description?: string;
    onAction?: () => void;
    actionButtonText?: string;
    cancelButtonText?: string;
    onCancelAction?: () => void;
  }>({
    visible: false,
    type: 'success',
    title: '',
  });

  const PROFILE_REASONS = ["Incorrect Profile Photo", "Profile Photo Not Clear"];
  const LICENSE_REASONS = ["Driving License Expired", "Incorrect Drivers License", "Name Mismatch", "Driving License Not Clear"];
  const VEHICLE_REASONS = ["Incorrect RC Book", "RC book Not Clear", "Insurance Expired", "Permit Validity Expired"];

  // Map backend comments to UI status/reason when driver details are loaded
  useEffect(() => {
    if (driverDetails) {
      // Profile
      if (driverDetails?.profileImageComments == "APPROVED") {
        setProfileStatus('APPROVED');
        setProfileReason('');
      } else if (driverDetails?.profileImageComments) {
        // Assume any non‑APPROVED value is a rejection reason
        setProfileStatus('REJECTED');
        setProfileReason(driverDetails?.profileImageComments);
      } else {
        setProfileStatus('PENDING');
      }
      // License
      if (driverDetails?.driverLicenseComments == "APPROVED") {
        setLicenseStatus('APPROVED');
        setLicenseReason('');
      } else if (driverDetails?.driverLicenseComments) {
        setLicenseStatus('REJECTED');
        setLicenseReason(driverDetails?.driverLicenseComments);
      } else {
        setLicenseStatus('PENDING');
      }
      // Vehicle
      if (driverDetails?.vehicleComments == "APPROVED") {
        setVehicleStatus('APPROVED');
        setVehicleReason('');
      } else if (driverDetails?.vehicleComments) {
        setVehicleStatus('REJECTED');
        setVehicleReason(driverDetails?.vehicleComments);
      } else {
        setVehicleStatus('PENDING');
      }
    }
  }, [driverDetails]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!driverId) {
        setIsLoading(false);
        return;
      }
      try {
        const [details, docs] = await Promise.all([
          driverService.getDriverDetails(driverId, partitionKey),
          driverService.getDriverDocuments(driverId, partitionKey)
        ]);
        setDriverDetails(details);
        setDriverDocuments(docs);
        if (details?.licenseExpiryDate) setLicenseExpiryDate(new Date(details.licenseExpiryDate));
        if (details?.insuranceValidTillDate) setInsuranceExpiryDate(new Date(details.insuranceValidTillDate));
        if (details?.vehiclePermitValidTillDate) setPermitExpiryDate(new Date(details.vehiclePermitValidTillDate));

        // Fetch vehicle details if identifier is present
        if (details?.currentAssociatedVehicleIdentifier) {
          try {
            const vDetails = await driverService.getVehicleDetails(details.currentAssociatedVehicleIdentifier, partitionKey);
            setVehicleDetails(vDetails);
          } catch (vError) {
            console.log("Error fetching vehicle details:", vError);
          }
        }
      } catch (error) {
        console.log("Error fetching driver data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
    return () => {
      setLocalImages({ profile: null, license: null, vehicle: null })
    }
  }, [driverId, partitionKey]);

  const licenseNo = driverDetails?.licenseNumber || 'N/A';
  const displayLicenseExpiry = licenseExpiryDate ? licenseExpiryDate.toISOString().split('T')[0] : 'Select Date';
  const displayInsuranceExpiry = insuranceExpiryDate ? insuranceExpiryDate.toISOString().split('T')[0] : 'Select Date';
  const displayPermitExpiry = permitExpiryDate ? permitExpiryDate.toISOString().split('T')[0] : 'Select Date';

  const plateNo = vehicleDetails?.plateNumber || vehicleDetails?.registrationNumber || vehicleDetails?.registrationNo || driverDetails?.plateNumber || 'N/A';
  const vehicleName = vehicleDetails?.vehicleName || vehicleDetails?.model || driverDetails?.vehicleName || 'N/A';
  const vehicleMake = vehicleDetails?.vehicleMake || vehicleDetails?.make || driverDetails?.vehicleMake || 'N/A';
  const vehicleType = vehicleDetails?.vehicleType || driverDetails?.associatedVehicleType || 'N/A';

  // Sync editable fields when data loads
  useEffect(() => {
    if (driverDetails || vehicleDetails) {
      setEditLicenseNo(licenseNo !== 'N/A' ? licenseNo : '');
      setEditPlateNo(plateNo !== 'N/A' ? plateNo : '');
      setEditVehicleName(vehicleName !== 'N/A' ? vehicleName : '');
      setEditVehicleMake(vehicleMake !== 'N/A' ? vehicleMake : '');
      setEditVehicleType(vehicleType !== 'N/A' ? vehicleType : '');
    }
  }, [driverDetails, vehicleDetails]);

  const renderDecisionButtons = useCallback((
    sectionId: string,
    currentStatus: ReviewStatus,
    setStatus: (status: ReviewStatus) => void,
    currentReason: string,
    setReason: (reason: string) => void,
    reasonsList: string[]
  ) => {
    const isApproved = currentStatus === "APPROVED";
    const isRejected = currentStatus === "REJECTED";
    const isDropdownOpen = openDropdownId === sectionId;

    return (
      <View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.decisionBtn,
              styles.decisionBtnReject,
              isRejected && styles.decisionBtnActiveReject
            ]}
            onPress={() => {
              setStatus('REJECTED');
              // Automatically open dropdown when rejecting
              if (!isRejected) setOpenDropdownId(sectionId);
            }}
          >
            <Text style={[styles.decisionBtnText, styles.textReject, isRejected && styles.textActive]}>
              ✗ Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.decisionBtn,
              styles.decisionBtnApprove,
              isApproved && styles.decisionBtnActiveApprove
            ]}
            onPress={() => {
              setStatus('APPROVED');
              setReason('');
              setOpenDropdownId(null);
            }}
          >
            <Text style={[styles.decisionBtnText, styles.textApprove, isApproved && styles.textActive]}>
              ✓ Approve
            </Text>
          </TouchableOpacity>
        </View>

        {isRejected && (
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => setOpenDropdownId(isDropdownOpen ? null : sectionId)}
            >
              <Text style={styles.dropdownHeaderText}>
                {currentReason || "Select Rejection Reason"}
              </Text>
              <Text style={{ color: colors.textSecondary }}>{isDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                {reasonsList.map(reason => (
                  <TouchableOpacity
                    key={reason}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setReason(reason);
                      setOpenDropdownId(null);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{reason}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  }, [openDropdownId, profileStatus, profileReason, licenseStatus, licenseReason, vehicleStatus, vehicleReason]);

  const handleChangeImage = async (type: 'profile' | 'license' | 'vehicle') => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.assets && result.assets.length > 0) {
        setLocalImages(prev => ({ ...prev, [type]: result.assets![0].uri }));
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  const handleUploadImage = async (type: 'profile' | 'license' | 'vehicle') => {
    const uri = localImages[type];
    if (!uri) return;

    const phone = driverDetails?.mobileNumber || driverDetails?.phone;
    if (!phone) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error',
        description: 'Driver phone number not found.',
      });
      return;
    }

    const typeMapping = {
      profile: 'ProfilePhoto',
      license: 'DriverLicense',
      vehicle: 'VehicleRegistration'
    };
    const documentType = typeMapping[type];

    setFeedback({
      visible: true,
      type: 'confirm',
      title: 'Confirm Upload',
      description: `Are you sure you want to upload this new ${type} image?`,
      actionButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      onAction: async () => {
        setFeedback(prev => ({ ...prev, visible: false })); // close confirm modal first
        setUploadingImage(type);
        try {
          await driverService.uploadDriverDocument(phone, documentType, uri);
          setLocalImages(prev => ({ ...prev, [type]: null }));
          // Show success feedback
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'success',
              title: 'Success',
              description: `${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded successfully!`,
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300); // small delay to allow previous modal to close smoothly
        } catch (error) {
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'error',
              title: 'Error',
              description: `Failed to upload ${type} image.`,
              onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
            });
          }, 300);
        } finally {
          setUploadingImage(null);
        }
      }
    });
  };

  const submitVerification = async () => {
    console.log('driverDetails', driverDetails);
    return
    if (profileStatus === 'PENDING' || licenseStatus === 'PENDING' || vehicleStatus === 'PENDING') {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Incomplete',
        description: 'Please approve or reject all sections before submitting.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    if ((profileStatus === 'REJECTED' && !profileReason) ||
      (licenseStatus === 'REJECTED' && !licenseReason) ||
      (vehicleStatus === 'REJECTED' && !vehicleReason)) {
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Missing Reason',
        description: 'Please select a rejection reason for all rejected sections.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    // setIsSaving(true);
    try {
      const userPhone = await AsyncStorage.getItem('userPhone');

      const payload = {
        ...driverDetails,
        licenseNumber: editLicenseNo || driverDetails?.licenseNumber,
        licenseExpiryDate: licenseExpiryDate ? licenseExpiryDate.toISOString() : driverDetails?.licenseExpiryDate,
        insuranceValidTillDate: insuranceExpiryDate ? insuranceExpiryDate.toISOString() : driverDetails?.insuranceValidTillDate,
        vehiclePermitValidTillDate: permitExpiryDate ? permitExpiryDate.toISOString() : driverDetails?.vehiclePermitValidTillDate,
        registrationNumber: editPlateNo || driverDetails?.plateNumber,
        vehicleName: editVehicleName || driverDetails?.vehicleName,
        vehicleMake: editVehicleMake || driverDetails?.vehicleMake,
        vehicleType: editVehicleType || driverDetails?.associatedVehicleType,
        profileImageComments: profileStatus === 'APPROVED' ? 'Approved' : profileReason,
        driverLicenseComments: licenseStatus === 'APPROVED' ? 'Approved' : licenseReason,
        vehicleComments: vehicleStatus === 'APPROVED' ? 'Approved' : vehicleReason,
        verificationStatus: profileStatus === 'APPROVED' && licenseStatus === 'APPROVED' && vehicleStatus === 'APPROVED' ? 'Approved' : 'Rejected',
        approvedBy: userPhone || ''
      };

      const result = await driverService.saveDriverVerification(payload);

      if (result && result?.status == 'Success' && result?.statusCode == 200) {
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Success',
          description: 'Driver verification status submitted successfully!',
          onAction: () => {
            setFeedback(prev => ({ ...prev, visible: false }));
            navigation.goBack();
          },
        });
      } else {
        setFeedback({
          visible: true,
          type: 'error',
          title: result?.status || 'Error',
          description: result?.message || 'Failed to save verification. Please try again.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }
    } catch (error) {
      console.log("Save verification error", error);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error',
        description: 'Failed to save verification. Please try again.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primaryText, fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification: {driverName}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

          {/* Driver Contact Info */}
          {driverDetails?.mobileNumber && (
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border
            }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Driver Contact</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>{driverDetails?.mobileNumber}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    const cleanPhone = driverDetails?.mobileNumber?.replace(/[^\d+]/g, '');
                    Linking.openURL(`tel:${cleanPhone}`).catch(err => console.log('Error opening dialer', err));
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.tabActiveBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <Text style={{ fontSize: 18 }}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const cleanPhone = driverDetails?.mobileNumber?.replace(/[^\d+]/g, '');
                    Linking.openURL(`sms:${cleanPhone}`).catch(err => console.log('Error opening SMS', err));
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.tabActiveBg,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <Text style={{ fontSize: 18 }}>💬</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* SECTION 1: Profile */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>1. Profile Image</Text>
            <View style={styles.profileContent}>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={() => {
                  const uri = localImages.profile || driverDocuments?.profilePhoto;
                  if (uri) setFullScreenImageURI(uri);
                }}>
                  <View style={styles.licenseAvatar}>
                    {localImages.profile || driverDocuments?.profilePhoto ? (
                      <Image
                        source={{ uri: localImages.profile || driverDocuments?.profilePhoto }}
                        style={styles.profilePhoto}
                      />
                    ) : (
                      <Text style={styles.placeholderEmoji}>👤</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
                  <TouchableOpacity onPress={() => handleChangeImage('profile')} style={styles.imageChangeButton}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Change Image</Text>
                  </TouchableOpacity>
                  {localImages.profile && (
                    <TouchableOpacity onPress={() => handleUploadImage('profile')} disabled={uploadingImage === 'profile'} style={styles.imageChangeButton}>
                      {uploadingImage === 'profile' ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <Text style={{ color: colors.success, fontWeight: 'bold' }}>Upload</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
            {renderDecisionButtons('profile', profileStatus, setProfileStatus, profileReason, setProfileReason, PROFILE_REASONS)}
          </View>

          {/* SECTION 2: License Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>2. License Details</Text>
            <View style={{ alignItems: 'center', marginVertical: 16, width: '100%' }}>
              <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} onPress={() => {
                const uri = localImages.license || driverDocuments?.driverLicense;
                if (uri) setFullScreenImageURI(uri);
              }}>
                <View style={styles.imagePlaceholderRect}>
                  {(localImages.license || driverDocuments?.driverLicense) ? (
                    <Image
                      source={{ uri: localImages.license || driverDocuments?.driverLicense }}
                      style={[styles.licensePhoto, { height: '100%' }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.placeholderEmoji}>🪪</Text>
                  )}
                </View>
                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>License Image</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 16, gap: 16 }}>
                <TouchableOpacity onPress={() => handleChangeImage('license')} style={styles.imageChangeButton}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Change Image</Text>
                </TouchableOpacity>
                {localImages.license && (
                  <TouchableOpacity onPress={() => handleUploadImage('license')} disabled={uploadingImage === 'license'} style={styles.imageChangeButton}>
                    {uploadingImage === 'license' ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={{ color: colors.success, fontWeight: 'bold' }}>Upload</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* License Edit Toggle */}
            <TouchableOpacity
              onPress={() => setIsLicenseEditing(prev => !prev)}
              style={styles.editToggleBtn}
            >
              <Text style={styles.editToggleBtnText}>
                {isLicenseEditing ? '✓ Done Editing' : '✎ Edit Fields'}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>License No.</Text>
              {isLicenseEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={editLicenseNo}
                  onChangeText={setEditLicenseNo}
                  placeholder="Enter license number"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
              ) : (
                <Text style={styles.infoValue}>{editLicenseNo || licenseNo}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expiry Date</Text>
              <TouchableOpacity onPress={() => setOpenLicensePicker(true)}>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{displayLicenseExpiry}</Text>
              </TouchableOpacity>
            </View>
            {renderDecisionButtons('license', licenseStatus, setLicenseStatus, licenseReason, setLicenseReason, LICENSE_REASONS)}
          </View>

          {/* SECTION 3: Vehicle Details */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>3. Vehicle Details</Text>
            <View style={{ alignItems: 'center', marginVertical: 16, width: '100%' }}>
              <TouchableOpacity style={{ width: '100%', alignItems: 'center' }} onPress={() => {
                const uri = localImages.vehicle || driverDocuments?.vehicleRegistration;
                if (uri) setFullScreenImageURI(uri);
              }}>
                <View style={styles.imagePlaceholderRect}>
                  {(localImages.vehicle || driverDocuments?.vehicleRegistration) ? (
                    <Image
                      source={{ uri: localImages.vehicle || driverDocuments?.vehicleRegistration }}
                      style={[styles.licensePhoto, { height: '100%' }]}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.placeholderEmoji}>🚗</Text>
                  )}
                </View>
                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Vehicle Image</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 16, gap: 16 }}>
                <TouchableOpacity onPress={() => handleChangeImage('vehicle')} style={styles.imageChangeButton}>
                  <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Change Image</Text>
                </TouchableOpacity>
                {localImages.vehicle && (
                  <TouchableOpacity onPress={() => handleUploadImage('vehicle')} disabled={uploadingImage === 'vehicle'} style={styles.imageChangeButton}>
                    {uploadingImage === 'vehicle' ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={{ color: colors.success, fontWeight: 'bold' }}>Upload</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* Vehicle Edit Toggle */}
            <TouchableOpacity
              onPress={() => setIsVehicleEditing(prev => !prev)}
              style={styles.editToggleBtn}
            >
              <Text style={styles.editToggleBtnText}>
                {isVehicleEditing ? '✓ Done Editing' : '✎ Edit Fields'}
              </Text>
            </TouchableOpacity>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plate Number</Text>
              {isVehicleEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={editPlateNo}
                  onChangeText={setEditPlateNo}
                  placeholder="Enter plate number"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
              ) : (
                <Text style={styles.infoValue}>{editPlateNo || plateNo}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle Name</Text>
              {isVehicleEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={editVehicleName}
                  onChangeText={setEditVehicleName}
                  placeholder="Enter vehicle name"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>{editVehicleName || vehicleName}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Make</Text>
              {isVehicleEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={editVehicleMake}
                  onChangeText={setEditVehicleMake}
                  placeholder="Enter make"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>{editVehicleMake || vehicleMake}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type</Text>
              {isVehicleEditing ? (
                <TextInput
                  style={styles.inlineInput}
                  value={editVehicleType}
                  onChangeText={setEditVehicleType}
                  placeholder="Enter vehicle type"
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={styles.infoValue}>{editVehicleType || vehicleType}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Insurance Expiry</Text>
              <TouchableOpacity onPress={() => setOpenInsurancePicker(true)}>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{displayInsuranceExpiry}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Permit Expiry</Text>
              <TouchableOpacity onPress={() => setOpenPermitPicker(true)}>
                <Text style={[styles.infoValue, { color: colors.primary }]}>{displayPermitExpiry}</Text>
              </TouchableOpacity>
            </View>
            {renderDecisionButtons('vehicle', vehicleStatus, setVehicleStatus, vehicleReason, setVehicleReason, VEHICLE_REASONS)}
          </View>

          {/* Submit */}
          <View style={styles.submitButtonBlock}>
            <TouchableOpacity
              style={[styles.submitButton, isSaving && { opacity: 0.7 }]}
              onPress={submitVerification}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Verification</Text>
              )}
            </TouchableOpacity>
          </View>

          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <DatePicker
        modal
        mode="date"
        open={openLicensePicker}
        date={licenseExpiryDate || new Date()}
        onConfirm={(date) => {
          setOpenLicensePicker(false);
          setLicenseExpiryDate(date);
        }}
        onCancel={() => {
          setOpenLicensePicker(false);
        }}
      />

      <DatePicker
        modal
        mode="date"
        open={openInsurancePicker}
        date={insuranceExpiryDate || new Date()}
        onConfirm={(date) => {
          setOpenInsurancePicker(false);
          setInsuranceExpiryDate(date);
        }}
        onCancel={() => {
          setOpenInsurancePicker(false);
        }}
      />

      <DatePicker
        modal
        mode="date"
        open={openPermitPicker}
        date={permitExpiryDate || new Date()}
        onConfirm={(date) => {
          setOpenPermitPicker(false);
          setPermitExpiryDate(date);
        }}
        onCancel={() => {
          setOpenPermitPicker(false);
        }}
      />

      <Modal
        visible={!!fullScreenImageURI}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImageURI(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }}
            onPress={() => setFullScreenImageURI(null)}
          >
            <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
          {fullScreenImageURI && (
            <Image
              source={{ uri: fullScreenImageURI }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <FeedbackBottomSheet
        visible={feedback.visible}
        onClose={() => setFeedback(prev => ({ ...prev, visible: false }))}
        type={feedback.type}
        title={feedback.title}
        description={feedback.description}
        showActionButton={true}
        onAction={feedback.onAction}
        actionButtonText={feedback.actionButtonText}
        cancelButtonText={feedback.cancelButtonText}
        onCancelAction={feedback.onCancelAction}
      />
    </View>
  );
}
