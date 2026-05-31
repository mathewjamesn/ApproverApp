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
  background: '#F8F9FA',
  card: '#FFFFFF',
  textPrimary: '#1E293B',       // Slate 800
  textSecondary: '#64748B',     // Slate 500
  border: '#F1F5F9',            // Slate 100
  primary: '#0B6A96',           // GMTApprover Blue
  primaryText: '#FFFFFF',
  danger: '#EF4444',            // Red 500
  cardShadow: '#000000',
  tabActiveBg: '#E0F2FE',       // Sky 100
  inputBg: '#FAFAF9',           // Stone 50
  success: '#10B981',           // Emerald 500
  info: '#3B82F6',              // Blue 500
  accent: '#0EA5E9',            // Sky 500
};

export const darkColors: ThemeColors = {
  background: '#0F172A',        // Slate 900
  card: '#041838ff',              // Slate 800
  textPrimary: '#F8FAFC',       // Slate 50
  textSecondary: '#94A3B8',     // Slate 400
  border: '#334155',            // Slate 700
  primary: '#1E293B',           // Deep space matching app background tone for headers
  primaryText: '#F8FAFC',
  danger: '#F87171',            // Red 400
  cardShadow: '#000000',
  tabActiveBg: '#334155',       // Slate 700
  inputBg: '#0F172A',           // Slate 900
  success: '#34D399',           // Emerald 400
  info: '#60A5FA',              // Blue 400
  accent: '#38BDF8',            // Sky 400
};
