import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../../theme/colors';

export const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: colors.primaryText,
    opacity: 0.8,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 12,
    marginHorizontal: 24,
    borderRadius: 16,
    marginTop: -20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.tabActiveBg,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'stretch',
  },
  driverCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  driverInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  driverCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  inlineActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  inlineActionBtnApprove: {
    backgroundColor: colors.success,
  },
  inlineActionBtnReject: {
    backgroundColor: colors.danger,
  },
  inlineActionBtnText: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconText: {
    fontSize: 18,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelButtonText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '600',
  },
});
