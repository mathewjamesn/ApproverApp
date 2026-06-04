export const API_BASE_URL = 'https://hound-functions-staging.azurewebsites.net/api';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/CustomerCareUserSignUp',
    VERIFY_OTP: '/Auth/CustomerCareUserSignIn',
  },
  DRIVER: {
    GET_PENDING: '/CustomerCare/GetDrivers/NotVerified',
    GET_REJECTED: '/CustomerCare/GetDrivers/Rejected',
    GET_BY_MOBILE: '/CustomerCare/GetByMobileNumber/',
    GET_DETAILS: '/Driver/Get/',
    GET_DOCUMENTS: '/CustomerCare/DriverDocuments/',
    BLOCK: '/CustomerCare/BlockAndUnBlockDriver/',
    RESET_RIDE: '/Driver/ResetRideStatus/',
    SAVE_VERIFICATION: '/Driver/Save/true',
    UPLOAD_DOCUMENT: '/CustomerCare/UploadDriverDocuments/',
  },
  VEHICLE: {
    GET_DETAILS: '/Vehicle/Get/',
  },
  TRIPS: {
    GET_ALL: '/CustomerCare/GetTrips/',
  },
  CUSTOMER_CARE: {
    GET_OTP: '/CustomerCare/GetDriverPassengerOtp/',
  },
  CONFIG: {
    GET_AIRPORT_FARE_MULTIPLIER: '/CustomerCare/GetCarFromAirportPercentageMultiplier',
    UPDATE_AIRPORT_FARE_MULTIPLIER: '/CustomerCare/UpdateCarFromAirportPercentageMultiplier/',
  }
};
