import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export type TripStatus = 'accepted' | 'cancelled_passenger' | 'rejected' | 'cancelled_driver' | 'ride_started' | 'skipped' | 'completed';

export interface Trip {
  id: string;
  driverId?: string;
  passengerId?: string;
  driverPhone?: string;
  passengerPhone?: string;
  status: TripStatus;
  date: string;
  fare: string;
  pickup: string;
  dropoff: string;
}

const generateMockTrips = (count: number): Trip[] => {
  const statuses: TripStatus[] = ['accepted', 'cancelled_passenger', 'rejected', 'cancelled_driver', 'ride_started', 'skipped', 'completed'];
  
  return Array.from({ length: count }, (_, i) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      id: `TRP-100${i}`,
      driverId: `DRV-99${i}`,
      passengerId: `PAS-55${i}`,
      status: randomStatus,
      date: new Date(Date.now() - i * 3600000).toISOString(),
      fare: `₹${(Math.random() * 500 + 100).toFixed(2)}`,
      pickup: '123 Main Street, City Center',
      dropoff: '456 Airport Road, Terminal 1',
    };
  });
};

const MOCK_TRIPS = generateMockTrips(20);

const delay = (ms: number) => new Promise(resolve => setTimeout(() => resolve(undefined), ms));

export const fetchRecentTrips = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get(`${ENDPOINTS.TRIPS.GET_ALL}250`);
    return response.data || [];
  } catch (error) {
    console.log("Error fetching trips:", error);
    return [];
  }
};

export const fetchTripsByDriver = async (phone: string): Promise<Trip[]> => {
  await delay(800);
  // In a real app we query backend with phone. Here we just return mock list.
  // We can pretend to filter by tagging some with this exact phone if we wanted.
  return MOCK_TRIPS.slice(0, 5).map(t => ({ ...t, driverPhone: phone }));
};

export const fetchTripsByPassenger = async (phone: string): Promise<Trip[]> => {
  await delay(800);
  return MOCK_TRIPS.slice(5, 12).map(t => ({ ...t, passengerPhone: phone }));
};

export const fetchTripStatsToday = async () => {
  await delay(500);
  return {
    total: 128,
  };
};
