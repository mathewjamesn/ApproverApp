import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export interface RegistrationObject {
  totalRegistered: number;
  approved: number;
  pendingVerification: number;
  documentPending: number;
  rejected: number;
  state: string;
}

export type RegistrationSummary = RegistrationObject[];

export interface CompletedTripDayReport {
  date: string;
  count: number;
}

export interface RecentlyCompletedTripsData {
  total: number;
  daily: CompletedTripDayReport[];
}

const formatToDDMMYYYY = (dateInput?: string): string => {
  if (!dateInput) return 'Date';
  const dateOnly = dateInput.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const d = new Date(dateInput);
  if (!isNaN(d.getTime())) {
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }
  return dateInput;
};

export interface TopOnlineDriver {
  driverName?: string;
  name?: string;
  mobileNumber?: string;
  phone?: string;
  partitionKey?: string;
  city?: string;
  onlineHours?: number;
  onlineTime?: string | number;
  onlineDurationMinutes?: number;
  tripsCount?: number;
  rank?: number;
  [key: string]: any;
}

export const reportsService = {
  getRecentlyCompletedTripsCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.REPORTS.RECENT_COMPLETED_TRIPS}10`);
      if (Array.isArray(response.data)) {
        return response.data.reduce((acc: number, curr: any) => acc + (curr.trips || curr.count || 0), 0);
      }
      return 0;
    } catch (error) {
      console.log('Error fetching recently completed trips:', error);
      return 0;
    }
  },

  getRecentlyCompletedTripsReport: async (days: number = 5): Promise<RecentlyCompletedTripsData> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.REPORTS.RECENT_COMPLETED_TRIPS}${days}`);
      const data = response.data;
      if (Array.isArray(data)) {
        let total = 0;
        const daily: CompletedTripDayReport[] = data.map((item: any) => {
          const dateRaw = item.createdDate || item.date || item.day || item.createdOn || item.tripDate || item.dateString || item.id || '';
          const formattedDate = formatToDDMMYYYY(dateRaw);
          const cnt = item.trips ?? item.count ?? item.totalTrips ?? item.total ?? item.completedTrips ?? 0;
          const numCount = typeof cnt === 'number' ? cnt : (parseInt(cnt, 10) || 0);
          total += numCount;
          return {
            date: formattedDate,
            count: numCount,
          };
        });
        return { total, daily };
      }
      return { total: 0, daily: [] };
    } catch (error) {
      console.log(`Error fetching recently completed trips report for ${days} days:`, error);
      return { total: 0, daily: [] };
    }
  },

  getDriverRegistrationSummary: async (): Promise<RegistrationSummary> => {
    try {
      const response = await apiClient.get(ENDPOINTS.REPORTS.GET_DRIVER_REGISTRATION_SUMMARY);
      return response.data;
    } catch (error) {
      console.log('Error fetching driver registration summary:', error);
      throw error;
    }
  },

  getTopOnlineDrivers: async (period: string = '2026-09'): Promise<TopOnlineDriver[]> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.REPORTS.TOP_ONLINE_DRIVERS}?period=${period}`);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && Array.isArray(data.drivers)) {
        return data.drivers;
      }
      if (data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.log(`Error fetching top online drivers for period ${period}:`, error);
      return [];
    }
  },

  getDriversCountByAvailabilityStatus: async (
    city: string,
    vehicleType: 'Car' | 'Auto',
    status: string = 'online'
  ): Promise<number> => {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.REPORTS.GET_DRIVERS_BY_AVAILABILITY}${encodeURIComponent(city)}/${encodeURIComponent(vehicleType)}/${encodeURIComponent(status)}`
      );
      const dataResponse = response?.data;      
      const data = dataResponse?.totalDrivers ?? 0;
      return data;
    } catch (error) {
      console.log(`Error fetching availability status for ${city}/${vehicleType}/${status}:`, error);
      return 0;
    }
  }
};
