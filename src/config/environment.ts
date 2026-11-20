import AsyncStorage from '@react-native-async-storage/async-storage';

export type EnvironmentType = 'PRODUCTION' | 'STAGING';

export const ENVIRONMENT_STORAGE_KEY = 'appEnvironment';

export const ENVIRONMENT_URLS: Record<EnvironmentType, string> = {
  PRODUCTION: 'https://tok-apim-prod.azure-api.net/api',
  STAGING: 'https://tok-apim-stgng.azure-api.net/api',
};

let currentEnvironment: EnvironmentType = 'PRODUCTION';

export const getEnvironmentUrl = (environment: EnvironmentType) =>
  ENVIRONMENT_URLS[environment];

export const getCurrentEnvironment = () => currentEnvironment;

export const getCurrentApiBaseUrl = () => getEnvironmentUrl(currentEnvironment);

/**
 * Direct function app URLs (APIM is the fallback). To send a route back through APIM, remove its entry here
 * or set DIRECT_FUNCTIONS to false. Add the staging host names when they are known.
 */
export const DIRECT_FUNCTIONS = true;

type FunctionApp = 'admin' | 'driver' | 'passenger' | 'vehicle' | 'platform';

export const FUNCTION_URLS: Record<EnvironmentType, Partial<Record<FunctionApp, string>>> = {
  PRODUCTION: {
    admin: 'https://admin-tok-functions-prod.azurewebsites.net/api',
    driver: 'https://driver-tok-functions-prod.azurewebsites.net/api',
    passenger: 'https://passenger-tok-functions-prod.azurewebsites.net/api',
    vehicle: 'https://vehicle-tok-functions-prod.azurewebsites.net/api',
    platform: 'https://platform-tok-functions-prod.azurewebsites.net/api',
  },
  STAGING: {},
};

const FUNCTION_ROUTES: Array<[RegExp, FunctionApp]> = [
  [/^\/(Auth|CustomerCare|Reports)\//i, 'admin'],
  [/^\/Notification\//i, 'platform'],
  [/^\/Driver\//i, 'driver'],
  [/^\/Vehicle\//i, 'vehicle'],
  [/^\/Passenger\//i, 'passenger'],
];

/** Base URL for one request path, e.g. '/Driver/Get/1/Kerala'. Falls back to APIM when no direct URL is set. */
export const getApiBaseUrlForPath = (path: string): string => {
  if (DIRECT_FUNCTIONS) {
    for (const [pattern, app] of FUNCTION_ROUTES) {
      if (pattern.test(path)) {
        const url = FUNCTION_URLS[currentEnvironment][app];
        if (url) return url;
      }
    }
  }
  return getCurrentApiBaseUrl();
};

export const hydrateEnvironment = async (): Promise<EnvironmentType> => {
  try {
    const storedEnvironment = await AsyncStorage.getItem(ENVIRONMENT_STORAGE_KEY);

    if (storedEnvironment === 'PRODUCTION' || storedEnvironment === 'STAGING') {
      currentEnvironment = storedEnvironment;
    }
  } catch (error) {
    console.log('Failed to load app environment', error);
  }

  return currentEnvironment;
};

export const setCurrentEnvironment = async (
  environment: EnvironmentType,
): Promise<void> => {
  currentEnvironment = environment;
  await AsyncStorage.setItem(ENVIRONMENT_STORAGE_KEY, environment);
};
