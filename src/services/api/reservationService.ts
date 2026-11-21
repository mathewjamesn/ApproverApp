import apiClient from './client';
import { ENDPOINTS } from './endpoints';

/**
 * Reservations for approvers (TOK Admin functions, ReservationApproverController). The token's
 * region decides which reservations are returned.
 *
 *   list           → GET  /CustomerCare/Reservations/{daysAhead}
 *   one            → GET  /CustomerCare/Reservation/{id}
 *   drivers        → GET  /CustomerCare/Reservation/{id}/EligibleDrivers
 *   assign         → POST /CustomerCare/Reservation/{id}/Assign/{driverId}
 *   cancellations  → GET  /CustomerCare/ReservationCancellations/{days}
 */

export type ReservationStatus =
  | 'Open'
  | 'DriverAccepted'
  | 'AwaitingConfirmation'
  | 'Dispatching'
  | 'ConvertedToTrip'
  | 'Failed'
  | 'CancelledByRider';

type Place = { locationName?: string | null };

export interface ReservationDriver {
  driverId: string;
  name?: string;
  mobileNumber?: string;
  vehicleNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleCategory?: string;
}

export interface ReservationRelease {
  driverId: string;
  atUtc: string;
  /** Released, Declined, NoReply, NotApproved, NotStarted, CancelledTrip, Reassigned. */
  reason: string;
  isLate: boolean;
  minutesBeforePickup: number;
}

export interface Reservation {
  id: string;
  status: ReservationStatus;
  passengerId: string;
  passengerMobileNumber?: string;
  vehicleCategory: string;
  fareEstimate: number;
  totalEstimate?: number;
  pickupAtUtc: string;
  confirmAtUtc: string;
  createdOn?: string;
  assignedDriver?: ReservationDriver | null;
  driverAcceptedAtUtc?: string | null;
  releases?: ReservationRelease[];
  reminderSentAtUtc?: string | null;
  finalReminderSentAtUtc?: string | null;
  navigateAtUtc?: string | null;
  lastDispatchAtUtc?: string | null;
  dispatchRound?: number;
  delayNotifiedAtUtc?: string | null;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  cancelledAtUtc?: string | null;
  cancelledMinutesBeforePickup?: number | null;
  noShowAtUtc?: string | null;
  failedAtUtc?: string | null;
  incentiveAmount?: number;
  rideRequestId?: string | null;
  rideRequest?: {
    passengerFromAddress?: Place | null;
    passengerToAddress?: Place | null;
    distanceInKilometers?: number | null;
  } | null;
}

export interface ReservationView {
  reservation: Reservation;
  /** No driver and pickup within an hour. */
  needsAttention: boolean;
  minutesToPickup: number;
}

export interface EligibleDriver {
  driverId: string;
  name?: string;
  mobileNumber?: string;
  vehicleCategory?: string;
  vehicleNumber?: string;
  cancelsThisMonth: number;
}

export interface DriverCancelStats {
  driverId: string;
  cancelCount: number;
  lateCancelCount: number;
  notStartedCount: number;
  recentCancelsUtc?: string[];
}

export interface PassengerCancellation {
  reservationId: string;
  passengerId: string;
  passengerMobileNumber?: string;
  pickupAtUtc: string;
  atUtc: string;
  minutesBeforePickup: number;
  kind: 'Cancelled' | 'NoShow';
  reason?: string | null;
  cancellationFee?: number;
}

/** TOK's own error text ("This driver already holds the reservation.") when it sent one. */
export const reservationError = (error: any): string | null => {
  const data = error?.response?.data;
  const message = data?.error ?? data?.Error;
  return typeof message === 'string' ? message : null;
};

export const placeName = (p?: Place | null) => p?.locationName || '';

export const reservationService = {
  async getReservations(daysAhead = 7) {
    const res = await apiClient.get(`${ENDPOINTS.RESERVATIONS.LIST}${daysAhead}`);
    return {
      needsAttention: (res.data?.needsAttention ?? 0) as number,
      reservations: (res.data?.reservations ?? []) as ReservationView[],
    };
  },

  async getReservation(id: string): Promise<ReservationView> {
    const res = await apiClient.get(`${ENDPOINTS.RESERVATIONS.DETAILS}${encodeURIComponent(id)}`);
    return { reservation: res.data?.reservation, needsAttention: !!res.data?.needsAttention, minutesToPickup: res.data?.minutesToPickup ?? 0 };
  },

  async getEligibleDrivers(id: string): Promise<EligibleDriver[]> {
    const res = await apiClient.get(`${ENDPOINTS.RESERVATIONS.DETAILS}${encodeURIComponent(id)}/EligibleDrivers`);
    return res.data?.drivers ?? [];
  },

  async assign(id: string, driverId: string): Promise<Reservation> {
    const res = await apiClient.post(`${ENDPOINTS.RESERVATIONS.DETAILS}${encodeURIComponent(id)}/Assign/${encodeURIComponent(driverId)}`);
    return res.data?.reservation;
  },

  async getCancellations(days = 30) {
    const res = await apiClient.get(`${ENDPOINTS.RESERVATIONS.CANCELLATIONS}${days}`);
    return {
      drivers: (res.data?.drivers ?? []) as DriverCancelStats[],
      passengers: (res.data?.passengers ?? []) as PassengerCancellation[],
    };
  },
};
