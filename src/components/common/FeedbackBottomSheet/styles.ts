import { StyleSheet, Dimensions } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

const { height } = Dimensions.get('window');

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36, // extra padding for bottom safe area
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeIconText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconSuccess: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  iconError: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  iconConfirm: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)', // Info blue
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSuccess: {
    backgroundColor: colors.primary,
  },
  buttonError: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonRowItem: {
    flex: 1,
  },
  buttonConfirm: {
    backgroundColor: colors.info || '#007AFF', // Using info color for confirm action
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textCancel: {
    color: colors.textPrimary,
  },
});
