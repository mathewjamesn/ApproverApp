import React, { useState, useEffect } from 'react';
import { openMessageOptions } from '../../../utils/messaging';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { getStyles } from '../DriverVerificationDetailsScreen/styles';
import { driverService } from '../../../services/api/driverService';
import DatePicker from 'react-native-date-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FeedbackBottomSheet from '../../../components/common/FeedbackBottomSheet';
import { requestCameraPermission, requestGalleryPermission } from '../../../utils/cameraPermission';

export default function DriverUpdateScreen() {
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

  const [localImages, setLocalImages] = useState<{
    profile: string | null;
    license: string | null;
    vehicle: string | null;
  }>({ profile: null, license: null, vehicle: null });

  const [fullScreenImageURI, setFullScreenImageURI] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [imageSourceModal, setImageSourceModal] = useState<'profile' | 'license' | 'vehicle' | null>(null);

  // Edit mode toggles
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isLicenseEditing, setIsLicenseEditing] = useState(false);
  const [isVehicleEditing, setIsVehicleEditing] = useState(false);

  // Editable personal info fields
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [openDobPicker, setOpenDobPicker] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');

  // Editable license & vehicle fields
  const [editLicenseNo, setEditLicenseNo] = useState('');
  const [editPlateNo, setEditPlateNo] = useState('');
  const [editVehicleType, setEditVehicleType] = useState('');

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    description?: string;
    onAction?: () => void;
    actionButtonText?: string;
    cancelButtonText?: string;
    onCancelAction?: () => void;
  }>({ visible: false, type: 'success', title: '' });

  // ─── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDetails = async () => {
      if (!driverId) {
        setIsLoading(false);
        return;
      }
      try {
        const [details, docs] = await Promise.all([
          driverService.getDriverDetails(driverId, partitionKey),
          driverService.getDriverDocuments(driverId, partitionKey),
        ]);
        setDriverDetails(details);
        setDriverDocuments(docs);
        if (details?.licenseExpiryDate) setLicenseExpiryDate(new Date(details.licenseExpiryDate));
        if (details?.insuranceValidTillDate) setInsuranceExpiryDate(new Date(details.insuranceValidTillDate));
        if (details?.vehiclePermitValidTillDate) setPermitExpiryDate(new Date(details.vehiclePermitValidTillDate));

        if (details?.currentAssociatedVehicleIdentifier) {
          try {
            const vDetails = await driverService.getVehicleDetails(
              details.currentAssociatedVehicleIdentifier,
              partitionKey,
            );
            setVehicleDetails(vDetails);
          } catch (vError) {
            console.log('Error fetching vehicle details:', vError);
          }
        }
      } catch (error) {
        console.log('Error fetching driver data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
    return () => setLocalImages({ profile: null, license: null, vehicle: null });
  }, [driverId, partitionKey]);

  // Derived display values
  const licenseNo = driverDetails?.licenseNumber || 'N/A';
  const displayLicenseExpiry = licenseExpiryDate
    ? licenseExpiryDate.toISOString().split('T')[0]
    : 'Select Date';
  const displayInsuranceExpiry = insuranceExpiryDate
    ? insuranceExpiryDate.toISOString().split('T')[0]
    : 'Select Date';
  const displayPermitExpiry = permitExpiryDate
    ? permitExpiryDate.toISOString().split('T')[0]
    : 'Select Date';

  const displayDob = dobDate
    ? dobDate.toISOString().split('T')[0]
    : 'Select Date of Birth';

  const plateNo =
    vehicleDetails?.plateNumber ||
    vehicleDetails?.registrationNumber ||
    vehicleDetails?.registrationNo ||
    driverDetails?.plateNumber ||
    'N/A'
  const vehicleName =
    vehicleDetails?.vehicleModel || 'N/A';
  const vehicleMake =
    vehicleDetails?.vehicleMake || vehicleDetails?.make || driverDetails?.vehicleMake || 'N/A';
  const vehicleType =
    vehicleDetails?.vehicleType || driverDetails?.associatedVehicleType || 'N/A';

  // Sync editable fields once data loads
  useEffect(() => {
    if (driverDetails) {
      if (driverDetails.firstName !== undefined && driverDetails.firstName !== null) {
        setEditFirstName(driverDetails.firstName || '');
        setEditLastName(driverDetails.lastName || '');
      } else if (driverDetails.driverName) {
        const parts = driverDetails.driverName.trim().split(' ');
        setEditFirstName(parts[0] || '');
        setEditLastName(parts.slice(1).join(' ') || '');
      } else if (driverName && driverName !== 'Unknown Driver') {
        const parts = driverName.trim().split(' ');
        setEditFirstName(parts[0] || '');
        setEditLastName(parts.slice(1).join(' ') || '');
      }

      const rawDob = driverDetails.dateOfBirth || driverDetails.dob || driverDetails.birthDate;
      if (rawDob) {
        try {
          const parsed = new Date(rawDob);
          if (!isNaN(parsed.getTime())) {
            setDobDate(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }

      setEditEmail(driverDetails.email || driverDetails.emailAddress || '');
      setEditGender(driverDetails.gender || '');
      setEditAddress(driverDetails.address || driverDetails.residentialAddress || '');
      setEditCity(driverDetails.city || '');
      setEditState(driverDetails.state || '');
      setEditPincode(driverDetails.pincode || driverDetails.postalCode || '');
      setEditBloodGroup(driverDetails.bloodGroup || '');
    }

    if (driverDetails || vehicleDetails) {
      setEditLicenseNo(licenseNo !== 'N/A' ? licenseNo : '');
      setEditPlateNo(plateNo !== 'N/A' ? plateNo : '');
      setEditVehicleType(vehicleType !== 'N/A' ? vehicleType : '');
    }
  }, [driverDetails, vehicleDetails]);

  // ─── Image picking ────────────────────────────────────────────────────────────
  const handleChangeImage = (type: 'profile' | 'license' | 'vehicle') => {
    setImageSourceModal(type);
  };

  const pickFromGallery = async (type: 'profile' | 'license' | 'vehicle') => {
    setImageSourceModal(null);
    await new Promise<void>(resolve => setTimeout(() => resolve(), Platform.OS === 'android' ? 350 : 100));

    const granted = await requestGalleryPermission();
    if (!granted) {
      setFeedback({
        visible: true,
        type: 'confirm',
        title: 'Storage Permission Required',
        description: 'Storage permission is required to pick images. Please enable it in Settings.',
        actionButtonText: 'Settings',
        cancelButtonText: 'Cancel',
        onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        onAction: () => {
          setFeedback(prev => ({ ...prev, visible: false }));
          Linking.openSettings().catch(err => console.log('Cannot open settings', err));
        },
      });
      return;
    }
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.assets && result.assets.length > 0) {
        setLocalImages(prev => ({ ...prev, [type]: result.assets![0].uri }));
      }
    } catch (error) {
      console.log('Gallery picker error:', error);
    }
  };

  const pickFromCamera = async (type: 'profile' | 'license' | 'vehicle') => {
    setImageSourceModal(null);
    // Allow the modal dialog to dismiss completely so the Android Activity has window focus to show the permission prompt
    await new Promise<void>(resolve => setTimeout(() => resolve(), Platform.OS === 'android' ? 350 : 100));

    const { granted, neverAskAgain } = await requestCameraPermission();
    if (!granted) {
      if (neverAskAgain) {
        setFeedback({
          visible: true,
          type: 'confirm',
          title: 'Camera Permission Disabled',
          description: 'Camera permission has been disabled. Please open Settings and allow Camera access.',
          actionButtonText: 'Settings',
          cancelButtonText: 'Cancel',
          onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
          onAction: () => {
            setFeedback(prev => ({ ...prev, visible: false }));
            Linking.openSettings().catch(err => console.log('Cannot open settings', err));
          },
        });
      } else {
        setFeedback({
          visible: true,
          type: 'error',
          title: 'Permission Denied',
          description: 'Camera permission is required to take photos.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }
      return;
    }

    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
      if (result.assets && result.assets.length > 0) {
        setLocalImages(prev => ({ ...prev, [type]: result.assets![0].uri }));
      }
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  // ─── Image uploading ──────────────────────────────────────────────────────────
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
      vehicle: 'VehicleRegistration',
    };

    setFeedback({
      visible: true,
      type: 'confirm',
      title: 'Confirm Upload',
      description: `Are you sure you want to upload this new ${type} image?`,
      actionButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      onCancelAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      onAction: async () => {
        setFeedback(prev => ({ ...prev, visible: false }));
        setUploadingImage(type);
        try {
          await driverService.uploadDriverDocument(phone, typeMapping[type], uri);
          // setLocalImages(prev => ({ ...prev, [type]: null }));
          setTimeout(() => {
            setFeedback({
              visible: true,
              type: 'success',
              title: 'Success',
              description: `${type.charAt(0).toUpperCase() + type.slice(1)} image uploaded successfully!`,
              onAction: () => {
                setFeedback(prev => ({ ...prev, visible: false }))
                navigation.goBack();
              },
            });
          }, 300);
        } catch {
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
      },
    });
  };

  // ─── Save / submit ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userPhone = await AsyncStorage.getItem('userPhone');

      // Preserve the existing verification status — this is an update, not a review
      const payload = {
        ...driverDetails,
        firstName: editFirstName,
        lastName: editLastName,
        driverName: `${editFirstName} ${editLastName}`.trim() || editFirstName || driverDetails?.driverName,
        dateOfBirth: dobDate ? dobDate.toISOString() : driverDetails?.dateOfBirth,
        dob: dobDate ? dobDate.toISOString() : driverDetails?.dob,
        email: editEmail,
        emailAddress: editEmail,
        // gender: editGender,
        // address: editAddress,
        // city: editCity,
        // state: editState,
        // pincode: editPincode,
        // postalCode: editPincode,
        // bloodGroup: editBloodGroup,
        licenseNumber: editLicenseNo || driverDetails?.licenseNumber,
        licenseExpiryDate: licenseExpiryDate
          ? licenseExpiryDate.toISOString()
          : driverDetails?.licenseExpiryDate,
        insuranceValidTillDate: insuranceExpiryDate
          ? insuranceExpiryDate.toISOString()
          : driverDetails?.insuranceValidTillDate,
        vehiclePermitValidTillDate: permitExpiryDate
          ? permitExpiryDate.toISOString()
          : driverDetails?.vehiclePermitValidTillDate,
        registrationNumber: editPlateNo || driverDetails?.plateNumber,
        approvedBy: userPhone || '',
      };

      const result = await driverService.saveDriverVerification(payload);

      if (result && result?.status === 'Success' && result?.statusCode === 200) {
        setFeedback({
          visible: true,
          type: 'success',
          title: 'Saved!',
          description: 'Driver details updated successfully.',
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
          description: result?.message || 'Failed to save details. Please try again.',
          onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
        });
      }
    } catch (error) {
      console.log('Save driver update error:', error);
      setFeedback({
        visible: true,
        type: 'error',
        title: 'Error',
        description: 'Failed to save details. Please try again.',
        onAction: () => setFeedback(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Reusable image row ───────────────────────────────────────────────────────
  const renderImageRow = (
    type: 'profile' | 'license' | 'vehicle',
    uri: string | undefined,
    isCircle: boolean,
    placeholder: string,
  ) => (
    <View style={{ alignItems: 'center', marginVertical: 16, width: '100%' }}>
      <TouchableOpacity
        style={{ width: '100%', alignItems: 'center' }}
        onPress={() => {
          const src = localImages[type] || uri;
          if (src) setFullScreenImageURI(src);
        }}
      >
        {isCircle ? (
          <View style={styles.licenseAvatar}>
            {localImages[type] || uri ? (
              <Image
                source={{ uri: localImages[type] || uri }}
                style={styles.profilePhoto}
              />
            ) : (
              <Text style={styles.placeholderEmoji}>{placeholder}</Text>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholderRect}>
            {localImages[type] || uri ? (
              <Image
                source={{ uri: localImages[type] || uri }}
                style={[styles.licensePhoto, { height: '100%' }]}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.placeholderEmoji}>{placeholder}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
        <TouchableOpacity onPress={() => handleChangeImage(type)} style={styles.imageChangeButton}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Change Image</Text>
        </TouchableOpacity>
        {localImages[type] && (
          <TouchableOpacity
            onPress={() => handleUploadImage(type)}
            disabled={uploadingImage === type}
            style={styles.imageChangeButton}
          >
            {uploadingImage === type ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={{ color: colors.success, fontWeight: 'bold' }}>Upload</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primaryText, fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update: {driverName}</Text>
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
            {/* Driver Contact */}
            {driverDetails?.mobileNumber && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: colors.textSecondary,
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Driver Contact
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }}>
                    {driverDetails?.mobileNumber}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = driverDetails?.mobileNumber?.replace(/[^\d+]/g, '');
                      Linking.openURL(`tel:${cleanPhone}`).catch(err =>
                        console.log('Error opening dialer', err),
                      );
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.tabActiveBg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      const cleanPhone = driverDetails?.mobileNumber?.replace(/[^\d+]/g, '');
                      openMessageOptions(cleanPhone);
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.tabActiveBg,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* SECTION 1: Personal Information */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>1. Personal Information</Text>

              <TouchableOpacity
                onPress={() => setIsPersonalEditing(prev => !prev)}
                style={styles.editToggleBtn}
              >
                <Text style={styles.editToggleBtnText}>
                  {isPersonalEditing ? '✓ Done Editing' : '✎ Edit Fields'}
                </Text>
              </TouchableOpacity>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>First Name</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editFirstName}
                    onChangeText={setEditFirstName}
                    placeholder="Enter first name"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.infoValue}>{editFirstName || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Name</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editLastName}
                    onChangeText={setEditLastName}
                    placeholder="Enter last name"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.infoValue}>{editLastName || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <TouchableOpacity onPress={() => setOpenDobPicker(true)}>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    {displayDob}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editGender}
                    onChangeText={setEditGender}
                    placeholder="e.g. Male / Female"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.infoValue}>{editGender || 'N/A'}</Text>
                )}
              </View> */}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={styles.infoValue}>{editEmail || 'N/A'}</Text>
                )}
              </View>

              {/* <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editAddress}
                    onChangeText={setEditAddress}
                    placeholder="Enter address"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.infoValue}>{editAddress || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>City</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editCity}
                    onChangeText={setEditCity}
                    placeholder="Enter city"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.infoValue}>{editCity || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>State</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editState}
                    onChangeText={setEditState}
                    placeholder="Enter state"
                    placeholderTextColor={colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.infoValue}>{editState || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pincode</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editPincode}
                    onChangeText={setEditPincode}
                    placeholder="Enter pincode"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.infoValue}>{editPincode || 'N/A'}</Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Blood Group</Text>
                {isPersonalEditing ? (
                  <TextInput
                    style={styles.inlineInput}
                    value={editBloodGroup}
                    onChangeText={setEditBloodGroup}
                    placeholder="e.g. O+, A+"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                ) : (
                  <Text style={styles.infoValue}>{editBloodGroup || 'N/A'}</Text>
                )}
              </View> */}
            </View>

            {/* SECTION 2: Profile Image */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>2. Profile Image</Text>
              <View style={styles.profileContent}>
                {renderImageRow('profile', driverDocuments?.profilePhoto, true, '👤')}
              </View>
            </View>

            {/* SECTION 3: License Details */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>3. License Details</Text>
              {renderImageRow('license', driverDocuments?.driverLicense, false, '🪪')}

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
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    {displayLicenseExpiry}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SECTION 4: Vehicle Details */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>4. Vehicle Details</Text>
              {renderImageRow('vehicle', driverDocuments?.vehicleRegistration, false, '🚗')}

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
                <Text style={styles.infoLabel}>Make</Text>
                <Text style={styles.infoValue}>{vehicleMake}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model</Text>
                <Text style={styles.infoValue}>{vehicleName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>{vehicleType}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Insurance Expiry</Text>
                <TouchableOpacity onPress={() => setOpenInsurancePicker(true)}>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    {displayInsuranceExpiry}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Permit Expiry</Text>
                <TouchableOpacity onPress={() => setOpenPermitPicker(true)}>
                  <Text style={[styles.infoValue, { color: colors.primary }]}>
                    {displayPermitExpiry}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.submitButtonBlock}>
              <TouchableOpacity
                style={[styles.submitButton, isSaving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <DatePicker
        modal
        mode="date"
        open={openDobPicker}
        date={dobDate || new Date(1995, 0, 1)}
        maximumDate={new Date()}
        onConfirm={date => {
          setOpenDobPicker(false);
          setDobDate(date);
        }}
        onCancel={() => setOpenDobPicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={openLicensePicker}
        date={licenseExpiryDate || new Date()}
        onConfirm={date => {
          setOpenLicensePicker(false);
          setLicenseExpiryDate(date);
        }}
        onCancel={() => setOpenLicensePicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={openInsurancePicker}
        date={insuranceExpiryDate || new Date()}
        onConfirm={date => {
          setOpenInsurancePicker(false);
          setInsuranceExpiryDate(date);
        }}
        onCancel={() => setOpenInsurancePicker(false)}
      />
      <DatePicker
        modal
        mode="date"
        open={openPermitPicker}
        date={permitExpiryDate || new Date()}
        onConfirm={date => {
          setOpenPermitPicker(false);
          setPermitExpiryDate(date);
        }}
        onCancel={() => setOpenPermitPicker(false)}
      />

      {/* Full-screen image viewer */}
      <Modal
        visible={!!fullScreenImageURI}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreenImageURI(null)}
      >
        <View
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
        >
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

      {/* Feedback sheet */}
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

      {/* Image source selection sheet */}
      <Modal
        visible={imageSourceModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImageSourceModal(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setImageSourceModal(null)}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: (insets.bottom || 0) + 24,
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Select Image Source
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: colors.background,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => imageSourceModal && pickFromCamera(imageSourceModal)}
            >
              <Text style={{ fontSize: 28 }}>📷</Text>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                  Camera
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Take a new photo
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 14,
                backgroundColor: colors.background,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              onPress={() => imageSourceModal && pickFromGallery(imageSourceModal)}
            >
              <Text style={{ fontSize: 28 }}>🖼️</Text>
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                  Gallery
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Choose from photo library
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 }}
              onPress={() => setImageSourceModal(null)}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.danger }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
