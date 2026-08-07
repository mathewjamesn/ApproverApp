import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export interface NotificationPayload {
  Message: string;
  Title: string;
  ViewName: string;
  UserType: 'Driver' | 'Passenger';
  ImageForNotification: string;
  Tags: string[];
  DevicePlatform: string;
}

export const notificationService = {
  sendNotification: async (payload: NotificationPayload): Promise<any> => {
    try {
      const response = await apiClient.post(ENDPOINTS.NOTIFICATION.SEND_NOTIFICATION, payload);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to send notification',
      };
    }
  },
};
