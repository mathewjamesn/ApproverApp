import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  
  // Segmented selector for Vehicle Type
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 24,
  },
  selectorOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectorOptionActive: {
    backgroundColor: colors.primary,
  },
  selectorOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectorOptionTextActive: {
    color: '#FFFFFF',
  },

  // Dropdown selector for Location
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
    marginBottom: 24,
  },
  dropdownTriggerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  dropdownTriggerText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  dropdownTriggerPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dropdownChevron: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownListContainer: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card,
    marginTop: -16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownOptionLast: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  dropdownOptionActive: {
    backgroundColor: colors.primary + '1A', // translucent primary color
  },
  dropdownOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Input wrapper & elements
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
    marginBottom: 24,
  },
  inputPrefix: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: colors.border,
    borderRightWidth: 1.5,
    borderRightColor: colors.border,
  },
  inputPrefixText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -16,
    marginBottom: 24,
    paddingLeft: 4,
  }
});
