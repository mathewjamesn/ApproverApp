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
  }
};
