export interface ThemeColors {
  background: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  cardShadow: string;
  tabActiveBg: string;
  inputBg: string;
  success: string;
  info: string;
  accent: string;
}

export const lightColors: ThemeColors = {
  background: '#F3F3F3',
  card: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#5E5E5E',
  border: '#E2E2E2',
  primary: '#000000',
  primaryText: '#FFFFFF',
  danger: '#B3261E',
  cardShadow: '#000000',
  tabActiveBg: '#C6F68D',       // light green
  inputBg: '#F3F3F3',
  success: '#0E7C4A',
  info: '#1F5FBF',
  accent: '#0E7C4A',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  card: '#1F1F1F',
  textPrimary: '#FFFFFF',
  textSecondary: '#B5B5B5',
  border: '#333333',
  primary: '#2A2A2A',
  primaryText: '#FFFFFF',
  danger: '#FF8A80',
  cardShadow: '#000000',
  tabActiveBg: '#2B3B1A',
  inputBg: '#1F1F1F',
  success: '#7BE0A6',
  info: '#8AB4FF',
  accent: '#C6F68D',
};
