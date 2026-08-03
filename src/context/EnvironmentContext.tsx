import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  EnvironmentType,
  getCurrentEnvironment,
  hydrateEnvironment,
  setCurrentEnvironment,
} from '../config/environment';

interface EnvironmentContextProps {
  environment: EnvironmentType;
  setEnvironment: (environment: EnvironmentType) => Promise<void>;
  isEnvironmentReady: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextProps>({
  environment: 'PRODUCTION',
  setEnvironment: async () => {},
  isEnvironmentReady: false,
});

export const EnvironmentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [environment, setEnvironmentState] = useState<EnvironmentType>(
    getCurrentEnvironment(),
  );
  const [isEnvironmentReady, setIsEnvironmentReady] = useState(false);

  useEffect(() => {
    const loadEnvironment = async () => {
      const activeEnvironment = await hydrateEnvironment();
      setEnvironmentState(activeEnvironment);
      setIsEnvironmentReady(true);
    };

    loadEnvironment();
  }, []);

  const setEnvironment = async (nextEnvironment: EnvironmentType) => {
    await setCurrentEnvironment(nextEnvironment);
    setEnvironmentState(nextEnvironment);
  };

  return (
    <EnvironmentContext.Provider
      value={{ environment, setEnvironment, isEnvironmentReady }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = () => useContext(EnvironmentContext);
