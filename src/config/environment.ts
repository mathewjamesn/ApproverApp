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
