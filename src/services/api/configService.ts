import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const configService = {
  getAirportFareMultiplier: async (): Promise<string> => {
    try {
      const response = await apiClient.get(ENDPOINTS.CONFIG.GET_AIRPORT_FARE_MULTIPLIER);
      return response.data?.carFromAirportPercentageMultiplier || '';
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get airport fare multiplier',
      };
    }
  },
  updateAirportFareMultiplier: async (value: string): Promise<any> => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.CONFIG.UPDATE_AIRPORT_FARE_MULTIPLIER}${value}`, {});
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update airport fare multiplier',
      };
    }
  },
};
