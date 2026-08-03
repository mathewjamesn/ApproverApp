import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export interface Driver {
  // Assuming these fields based on the UI. Will map dynamically if needed.
  id?: string;
  driverName?: string;
  mobileNumber?: string;
  status?: string;
  [key: string]: any; // Allow other fields to avoid strict type errors if backend returns more
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  raw: any;
}

const parseCoordinateValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const extractDriverLocation = (payload: any): DriverLocation | null => {
  const candidates = [payload, payload?.data, payload?.location, payload?.Location];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    const latitude = parseCoordinateValue(
      candidate.latitude ??
      candidate.Latitude ??
      candidate.lat ??
      candidate.Lat ??
      candidate.locationLatitude ??
      candidate.locationLat
    );

    const longitude = parseCoordinateValue(
      candidate.longitude ??
      candidate.Longitude ??
      candidate.lng ??
      candidate.Lng ??
      candidate.lon ??
      candidate.Lon ??
      candidate.locationLongitude ??
      candidate.locationLng
    );

    if (latitude !== null && longitude !== null) {
      return {
        latitude,
        longitude,
        raw: payload,
      };
    }
  }

  return null;
};

export const driverService = {
  getPendingDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.DRIVER.GET_PENDING);
      return response.data || [];
    } catch (error: any) {
      throw error;
    }
  },

  getRejectedDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.DRIVER.GET_REJECTED);
      return response.data || [];
    } catch (error: any) {
      throw error;
    }
  },

  getActiveDriverByPhone: async (phone: string): Promise<Driver[]> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.DRIVER.GET_BY_MOBILE}${phone}`);
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data) {
        return [data];
      }
      return [];
    } catch (error: any) {
      throw error;
    }
  },

  getDriverDetails: async (id: string, partitionKey: string): Promise<any> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.DRIVER.GET_DETAILS}${id}/${partitionKey}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getDriverLocationDetails: async (phone: string): Promise<DriverLocation | null> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.DRIVER.GET_LOCATION_DETAILS}${phone}/LocationDetails`);
      return extractDriverLocation(response.data);
    } catch (error: any) {
      throw error;
    }
  },

  getDriverDocuments: async (id: string, partitionKey: string): Promise<any> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.DRIVER.GET_DOCUMENTS}${id}/${partitionKey}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  blockDriver: async (phone: string, block: boolean): Promise<any> => {
    try {
      // Assuming POST method for an action endpoint without body.
      const response = await apiClient.post(`${ENDPOINTS.DRIVER.BLOCK}${phone}/${block}`, {});
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  deleteDriver: async (id: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.DRIVER.DELETE}${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  resetDriverRideStatus: async (phone: string): Promise<any> => {
    try {
      const response = await apiClient.post(`${ENDPOINTS.DRIVER.RESET_RIDE}${phone}`, {});
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  saveDriverVerification: async (payload: any): Promise<any> => {
    try {
      const response = await apiClient.post(ENDPOINTS.DRIVER.SAVE_VERIFICATION + "/" + payload?.partitionKey, payload);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  uploadDriverDocument: async (phone: string, documentType: string, imageUri: string): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append('fileToPost', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `image/${documentType}.jpg`,
      } as any);
      console.log('formData', formData);

      const response = await apiClient.post(
        `${ENDPOINTS.DRIVER.UPLOAD_DOCUMENT}${phone}/${documentType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getVehicleDetails: async (vehicleId: string, partitionKey: string): Promise<any> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.VEHICLE.GET_DETAILS}${vehicleId}/${partitionKey}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
};
