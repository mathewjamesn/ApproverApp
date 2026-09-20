import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export interface Passenger {
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  rideCancelCountForTheDay: number;
  totalRideCancelCount: number;
  isProfileUpdateComplete: boolean;
  temporarilyBlockedForCancellation: boolean;
  status: string;
  hasAcceptedAgreement: boolean;
  currentAppVersionInstalled: string;
  currentWalletAmount: number;
  totalKilometersCompleted: number;
  carbonUsageKg: number;
  partitionKey: string;
  [key: string]: any;
}

export const passengerService = {
  getPassengerByMobile: async (phone: string): Promise<Passenger> => {
    const response = await apiClient.get(`${ENDPOINTS.PASSENGER.GET_BY_MOBILE}${phone}`);
    return response.data;
  },
  blockPassenger: async (phone: string, block: boolean): Promise<any> => {
    const response = await apiClient.post(`${ENDPOINTS.PASSENGER.BLOCK}${phone}/${block}`, {});
    return response.data;
  },
  resetPassengerRideStatus: async (phone: string): Promise<any> => {
    const response = await apiClient.post(`${ENDPOINTS.PASSENGER.RESET_RIDE}${phone}`, {});
    return response.data;
  },
  deletePassenger: async (id: string, partitionKey: string): Promise<any> => {
    const response = await apiClient.delete(`${ENDPOINTS.PASSENGER.DELETE}${id}/${partitionKey}`);
    return response.data;
  },
  getPassengerCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get(ENDPOINTS.PASSENGER.GET_COUNT);
      if (typeof response.data === 'number') {
        return response.data;
      }
      if (typeof response.data === 'string') {
        const parsed = parseInt(response.data, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (response.data && typeof response.data === 'object') {
        const val = response.data.count ?? response.data.total ?? response.data.passengerCount ?? response.data.totalCount;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
      }
      return 0;
    } catch (error) {
      console.log('Error fetching passenger count:', error);
      return 0;
    }
  }
};
