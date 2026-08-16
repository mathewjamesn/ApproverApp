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

export const reportsService = {
  getRecentlyCompletedTripsCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get(ENDPOINTS.REPORTS.RECENT_COMPLETED_TRIPS);
      if (Array.isArray(response.data)) {
        return response.data.reduce((acc: number, curr: any) => acc + (curr.trips || 0), 0);
      }
      return 0;
    } catch (error) {
      console.log('Error fetching recently completed trips:', error);
      return 0;
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
  }
};
