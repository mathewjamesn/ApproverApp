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
  
  // Segmented selector for User Type
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
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    minHeight: 120,
    textAlignVertical: 'top',
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
});
