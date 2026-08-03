import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary, // Using primary for profile icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImageText: {
    fontSize: 24,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  environmentPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  environmentPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  menuChevron: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  destructiveText: {
    color: colors.danger,
  },
  themeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  themeToggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  themeToggleButtons: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  themeBtnActive: {
    backgroundColor: colors.primary,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeBtnTextActive: {
    color: colors.primaryText,
  },
});
