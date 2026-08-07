// export const API_BASE_URL = 'https://hound-functions-staging.azurewebsites.net/api';
export const API_BASE_URL = 'https://tok-apim-prod.azure-api.net/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/CustomerCareUserSignUp',
    VERIFY_OTP: '/Auth/CustomerCareUserSignIn',
  },
  DRIVER: {
    GET_PENDING: '/CustomerCare/GetDrivers/NotVerified/125',
    GET_REJECTED: '/CustomerCare/GetDrivers/Rejected',
    GET_BY_MOBILE: '/CustomerCare/GetByMobileNumber/',
    GET_DETAILS: '/Driver/Get/',
    GET_LOCATION_DETAILS: '/Driver/',
    GET_DOCUMENTS: '/CustomerCare/DriverDocuments/',
    BLOCK: '/CustomerCare/BlockAndUnBlockDriver/',
    DELETE: '/Driver/Delete/',
    RESET_RIDE: '/Driver/ResetRideStatus/',
    SAVE_VERIFICATION: '/Driver/Save/true',
    UPLOAD_DOCUMENT: '/CustomerCare/UploadDriverDocuments/',
  },
  VEHICLE: {
    GET_DETAILS: '/Vehicle/Get/',
  },
  TRIPS: {
    GET_ALL: '/CustomerCare/GetTrips/',
    GET_BY_DRIVER: '/Driver/',
    GET_BY_PASSENGER: '/passenger/',
  },
  CUSTOMER_CARE: {
    GET_OTP: '/CustomerCare/GetDriverPassengerOtp/',
  },
  CONFIG: {
    GET_AIRPORT_FARE_MULTIPLIER: '/CustomerCare/GetCarFromAirportPercentageMultiplier',
    UPDATE_AIRPORT_FARE_MULTIPLIER: '/CustomerCare/UpdateCarFromAirportPercentageMultiplier/',
    GET_PARTITION_KEYS: '/CustomerCare/GetConfigurationPartitionKeys',
    UPDATE_OVERALL_MULTIPLIER: '/CustomerCare/UpdateOverAllMultiplier/',
  },
  PASSENGER: {
    GET_BY_MOBILE: '/Passenger/GetByMobileNumber/',
    BLOCK: '/CustomerCare/BlockAndUnBlockPassenger/',
    RESET_RIDE: '/Passenger/ResetRideStatus/',
    DELETE: '/Passenger/Delete/',
  },
  REPORTS: {
    RECENT_COMPLETED_TRIPS: '/Reports/GetRecentlyCompletedTrips/10',
  },
  NOTIFICATION: {
    SEND_NOTIFICATION: '/Notification/SendNotification/false',
  }
};
