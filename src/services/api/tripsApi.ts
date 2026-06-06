import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export type TripStatus = 'accepted' | 'cancelled_passenger' | 'rejected' | 'cancelled_driver' | 'ride_started' | 'skipped' | 'completed';

export interface Trip {
  id: string;
  driverMobileNumber: string;
  driverName: string;
  passengerName: string;
  passengerMobileNumber: string;
  passengerPartitionKey: string;
  otp: string;
  isDriverCloseToPassengerWhenRideStarted: boolean;
  passengerIdentifier: string;
  tripCancelledDate: string | null;
  tripAcceptDate: string | null;
  tripStartDate: string | null;
  tripEndDate: string | null;
  fromLocation: string;
  toLocation: string;
  vehicleIdentifier: string;
  initialFareAmount: number;
  finalFareAmount: number;
  finalDistanceInKilometers: number;
  distanceInKilometers: number;
  driverIdentifier: string;
  tripStatus: string;
  vehicleCategory: string;
  vehicleType: string;
  createdOn: string;
  pickupCharges: number;
  totalPickupDistance: number;
  comments: string;
  passengerOptedPaymentMode: string;
  driverEarningsForTrip: number;
  gstCollectedForTrip: number;
  taxCollectedForTrip: number;
  onlinePaymentIncentiveCashBackEarned: number;
  additionalCostForTravelDelay: number;
  paymentStatus: string;
  amountAppliedFromWallet: number;
  finalAmountPaidByCustomer: number;
  partitionKey: string;
  rideRequestIdentifier: string;
  totalAggregatorCommissionAmount: number;
  totalServiceProviderCommissionAmount: number;
  tripPaymentChargesForDriver: number;
  gstOnPlatformCharges: number;
  totalPlatformCharges: number;
  [key: string]: any; // Catch any extra fields
}

const generateMockTrips = (count: number): Trip[] => {
  const statuses = ['PaymentComplete', 'RideStarted', 'DriverAccepted', 'CancelledByDriver', 'CancelledByPassenger'];

  return Array.from({ length: count }, (_, i) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: `29ddb65a-4b0c-43d4-b7d8-8270822d849${i}`,
      driverMobileNumber: `81380877${40 + i}`,
      driverName: `Driver ${i}`,
      passengerName: `Passenger ${i}`,
      passengerMobileNumber: `99953877${40 + i}`,
      passengerPartitionKey: "Kerala",
      otp: "8439",
      isDriverCloseToPassengerWhenRideStarted: false,
      passengerIdentifier: `pass-id-${i}`,
      tripCancelledDate: null,
      tripAcceptDate: "01-Jun-2026 10:52 PM",
      tripStartDate: "01-Jun-2026 10:52 PM",
      tripEndDate: "01-Jun-2026 10:52 PM",
      fromLocation: "Kollam Pattada, Kumily, Kerala 685509",
      toLocation: "Munnar Road, Idukki",
      vehicleIdentifier: `veh-id-${i}`,
      initialFareAmount: 66.79,
      finalFareAmount: 70.14,
      finalDistanceInKilometers: 2.7,
      distanceInKilometers: 2.7,
      driverIdentifier: `driver-id-${i}`,
      tripStatus: randomStatus,
      vehicleCategory: "Auto",
      vehicleType: "Auto",
      createdOn: new Date(Date.now() - i * 3600000).toISOString(),
      pickupCharges: 3.35,
      totalPickupDistance: 1.835,
      comments: "",
      passengerOptedPaymentMode: "Cash",
      driverEarningsForTrip: 65.932,
      gstCollectedForTrip: 0.76,
      taxCollectedForTrip: 0,
      onlinePaymentIncentiveCashBackEarned: 0,
      additionalCostForTravelDelay: 0,
      paymentStatus: "",
      amountAppliedFromWallet: 0,
      finalAmountPaidByCustomer: 70.14,
      partitionKey: "Kerala",
      rideRequestIdentifier: `req-id-${i}`,
      totalAggregatorCommissionAmount: 0,
      totalServiceProviderCommissionAmount: 4.208,
      tripPaymentChargesForDriver: 4.21,
      gstOnPlatformCharges: 0.76,
      totalPlatformCharges: 4.208
    };
  });
};

const MOCK_TRIPS = generateMockTrips(20);

const delay = (ms: number) => new Promise(resolve => setTimeout(() => resolve(undefined), ms));

export const fetchRecentTrips = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.TRIPS.GET_ALL}100`);
    return response.data || [];
  } catch (error) {
    console.log("Error fetching trips:", error);
    return [];
  }
};

export const fetchTripsByDriver = async (phone: string): Promise<Trip[]> => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.TRIPS.GET_BY_DRIVER}${phone}/TripList`);
    return response.data || [];
  } catch (error) {
    console.log("Error fetching trips by driver:", error);
    return [];
  }
};

export const fetchTripsByPassenger = async (phone: string): Promise<Trip[]> => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.TRIPS.GET_BY_PASSENGER}${phone}/TripList/Kerala`);
    return response.data || [];
  } catch (error) {
    console.log("Error fetching trips by passenger:", error);
    return [];
  }
};

export const fetchTripStatsToday = async () => {
  await delay(500);
  return {
    total: 128,
  };
};
