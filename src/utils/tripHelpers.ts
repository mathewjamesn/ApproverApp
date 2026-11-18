import { ThemeColors } from '../theme/colors';

export const isWithin24Hours = (dateInput?: string | null): boolean => {
  if (!dateInput) return false;
  const timeMs = new Date(dateInput).getTime();
  if (isNaN(timeMs)) return false;
  return Date.now() - timeMs <= 24 * 60 * 60 * 1000;
};

export const getEffectiveTripStatus = (trip: any): string => {
  const status = (trip?.tripStatus || '').trim();
  if (status === '') {
    const createdDate = trip?.createdOn || trip?.tripStartDate;
    if (isWithin24Hours(createdDate)) {
      return 'DriverAccepted';
    }
  }
  return status || 'Unknown';
};

export const isCancelledTrip = (status?: string): boolean => {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes('cancel') || s.includes('reject');
};

export const isAcceptedTrip = (status?: string): boolean => {
  if (!status) return false;
  return status.toLowerCase().includes('accept');
};

export const getCancelledDate = (trip: any): string | null =>
  trip?.tripCancelledDate ||
  trip?.cancelledDate ||
  trip?.cancelledOn ||
  trip?.cancellationTime ||
  null;

export const getEffectiveFare = (trip: any): number => {
  if (trip?.finalFareAmount && trip.finalFareAmount > 0) {
    return trip.finalFareAmount;
  }
  return trip?.initialFareAmount || trip?.estimatedFareAmount || trip?.tripFare || trip?.totalFare || 0;
};

export const formatTimeDisplay = (dateStr?: string | null): string => {
  if (!dateStr) return '--';
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString();
    }
  }
  return dateStr;
};

export const getStatusColor = (colors: ThemeColors, status?: string): string => {
  if (!status) return colors.textSecondary;
  const s = status.toLowerCase();
  if (s.includes('complete') || s === 'paymentcomplete') return colors.success;
  if (s.includes('driver') && s.includes('cancel')) return '#E11D48';
  if ((s.includes('passenger') || s.includes('customer')) && s.includes('cancel')) return '#F97316';
  if (s.includes('cancel') || s.includes('reject')) return colors.danger;
  if (s.includes('start')) return colors.info;
  if (s.includes('accept')) return colors.accent;
  return colors.textSecondary;
};

/* ---------------- Trip type: Normal / Rental / Reservation ---------------- */

export type TripKind = 'Normal' | 'Rental' | 'Reservation';

export const TRIP_KIND_META: Record<TripKind, { icon: string; color: string }> = {
  Normal: { icon: '🚕', color: '#64748B' },
  Rental: { icon: '⏱️', color: '#8B5CF6' },
  Reservation: { icon: '📅', color: '#14B8A6' },
};

/**
 * The backend trip object does not document a single "trip type" field, so this checks the
 * likely candidates. Adjust the key names here once the exact field is confirmed.
 */
export const getTripKind = (trip: any): TripKind => {
  const raw = String(
    trip?.tripType ??
      trip?.rideType ??
      trip?.bookingType ??
      trip?.tripCategory ??
      trip?.rideCategory ??
      '',
  ).toLowerCase();

  if (raw.includes('rental') || trip?.isRental === true || trip?.isRentalTrip === true) return 'Rental';
  if (
    raw.includes('reserv') ||
    raw.includes('schedul') ||
    trip?.isReservation === true ||
    trip?.isScheduled === true ||
    trip?.isScheduledTrip === true ||
    trip?.isReservationTrip === true
  ) {
    return 'Reservation';
  }
  return 'Normal';
};

export const getRentalPackage = (trip: any): string | null =>
  trip?.rentalPackageName || trip?.rentalPackage || trip?.packageName || null;

export const getReservationTime = (trip: any): string | null =>
  trip?.scheduledPickupTime ||
  trip?.reservationDateTime ||
  trip?.scheduledDateTime ||
  trip?.scheduledOn ||
  trip?.pickupDateTime ||
  null;

/* ---------------- Track driver navigation ---------------- */

export const buildTrackDriverParams = (trip: any) => ({
  driverName: trip?.driverName || 'Driver',
  phoneNumber: trip?.driverMobileNumber,
  title: 'Track Driver Location',
  tripData: trip,
  passengerFromAddress:
    trip?.passengerFromAddress ||
    (trip?.fromAddress
      ? {
          geoLocation: {
            latitude: trip.fromAddress.latitude,
            longitude: trip.fromAddress.longitude,
          },
          locationName: trip.fromLocation,
        }
      : undefined),
});

export const hasUsablePhone = (phone?: string | null): boolean =>
  !!phone && phone !== '--' && phone.trim() !== '';

export const openRouteInGoogleMaps = (trip: any): string => {
  const fromLat = trip?.fromAddress?.latitude;
  const fromLng = trip?.fromAddress?.longitude;
  const toLat = trip?.toAddress?.latitude;
  const toLng = trip?.toAddress?.longitude;
  const origin = fromLat && fromLng ? `${fromLat},${fromLng}` : encodeURIComponent(trip?.fromLocation || '');
  const dest = toLat && toLng ? `${toLat},${toLng}` : encodeURIComponent(trip?.toLocation || '');
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
};
