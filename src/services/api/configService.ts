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
  getConfigurationPartitionKeys: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.CONFIG.GET_PARTITION_KEYS);
      console.log('GetConfigurationPartitionKeys raw response:', response.data);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.partitionKeys)) {
        return response.data.partitionKeys;
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get partition keys',
      };
    }
  },
  updateOverallMultiplier: async (
    vehicleType: string,
    percentageSelected: string,
    selectedLocation: string,
    authCode: string
  ): Promise<any> => {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.CONFIG.UPDATE_OVERALL_MULTIPLIER}${vehicleType}/${percentageSelected}/${selectedLocation}`,
        { authCode }
      );
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update overall multiplier',
      };
    }
  },
};
