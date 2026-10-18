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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholderRect: {
    width: '100%',
    height: 150,
    backgroundColor: colors.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  licenseAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  decisionBtnReject: {
    backgroundColor: colors.danger + '22', // translucent
  },
  decisionBtnApprove: {
    backgroundColor: colors.success + '22', // translucent
  },
  decisionBtnActiveReject: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  decisionBtnActiveApprove: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  decisionBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  textReject: {
    color: colors.danger,
  },
  textApprove: {
    color: colors.success,
  },
  textActive: {
    color: '#FFF',
  },
  submitButtonBlock: {
    marginTop: 10,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  dropdownHeaderText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 10
  },
  licensePhoto: {
    width: '100%',
    height: 100,
    borderRadius: 10
  },
  imageChangeButton: {
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    paddingVertical: 8
  },
  editToggleBtn: {
    alignSelf: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.tabActiveBg,
  },
  editToggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  inlineInput: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    minWidth: 140,
    textAlign: 'right',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});
