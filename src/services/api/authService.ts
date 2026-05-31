import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export interface LoginRequest {
  mobileNumber: string;
  countryCode: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: any; // Define properly based exactly on what backend returns
  token?: string;
}

export interface VerifyOtpRequest {
  MobileNumber: string;
  DevicePlatform: string;
  CountryCode: string;
  DevicePnsHandle: string;
  Otp: string;
  PartitionKey: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  data?: any;
  token?: string;
}

export const authService = {
  /**
   * Authenticate a Customer Care User by sending their mobile number 
   * and receiving an OTP or success payload.
   */
  loginUser: async (payload: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        ENDPOINTS.AUTH.LOGIN,
        payload
      );
      console.log("LOGIN RESPONSE", response);
      return response.data;
    } catch (error: any) {
      // Return a structured error so the UI can easily display it
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to login',
      };
    }
  },

  /**
   * Verify OTP
   */
  verifyOtp: async (payload: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post<VerifyOtpResponse>(
        ENDPOINTS.AUTH.VERIFY_OTP,
        payload
      );
      console.log("VERIFY OTP RESPONSE", response);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to verify OTP',
      };
    }
  },

  /**
   * Get OTP for Driver or Passenger
   */
  getDriverPassengerOtp: async (phone: string, type: 'Driver' | 'Passenger'): Promise<any> => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.CUSTOMER_CARE.GET_OTP}${phone}/${type}`);
      return response.data;
    } catch (error: any) {
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get OTP',
      };
    }
  },
};
