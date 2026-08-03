import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 20,
      backgroundColor: colors.primary,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    backText: {
      color: colors.primaryText,
      fontSize: 24,
    },
    headerTextWrap: {
      flex: 1,
    },
    headerTitle: {
      color: colors.primaryText,
      fontSize: 20,
      fontWeight: '700',
    },
    headerSubtitle: {
      color: colors.primaryText,
      opacity: 0.8,
      marginTop: 2,
      fontSize: 13,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 12,
    },
    helperText: {
      color: colors.textSecondary,
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    errorTitle: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    mapContainer: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    locationCard: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    locationTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
    },
    locationValue: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 2,
    },
    previewBadge: {
      alignSelf: 'flex-start',
      marginBottom: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: colors.accent,
      color: colors.primaryText,
      fontSize: 12,
      fontWeight: '700',
      overflow: 'hidden',
    },
    previewHelper: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 10,
      lineHeight: 18,
    },
  });
