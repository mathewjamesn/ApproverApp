import type { ThemeColors } from '../theme/colors';
import type { Reservation, ReservationStatus } from '../services/api/reservationService';

export const AMBER = '#F59E0B';

/** How the approver sees each TOK status. */
export const STATUS_META: Record<ReservationStatus, { label: string; tone: 'info' | 'success' | 'warn' | 'danger' | 'muted' }> = {
  Open: { label: 'No driver yet', tone: 'warn' },
  DriverAccepted: { label: 'Driver assigned', tone: 'success' },
  AwaitingConfirmation: { label: 'Driver starting', tone: 'info' },
  Dispatching: { label: 'With nearby drivers', tone: 'warn' },
  ConvertedToTrip: { label: 'Trip', tone: 'success' },
  Failed: { label: 'No driver found', tone: 'danger' },
  CancelledByRider: { label: 'Cancelled', tone: 'muted' },
};

export const toneColor = (colors: ThemeColors, tone: 'info' | 'success' | 'warn' | 'danger' | 'muted') =>
  ({ info: colors.info, success: colors.success, warn: AMBER, danger: colors.danger, muted: colors.textSecondary })[tone];

/** Statuses an approver can assign or reassign a driver from. */
export const ASSIGNABLE: ReadonlySet<ReservationStatus> = new Set(['Open', 'DriverAccepted', 'Dispatching']);

/** "21 Nov, 6:00 PM" in the phone's time zone. */
export const formatWhen = (iso?: string | null) => {
  if (!iso) return '--';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}`;
};

/** "in 35 min", "in 2 h 5 min", "12 min ago". */
export const formatRelative = (minutes: number) => {
  const abs = Math.abs(minutes);
  const text = abs < 60 ? `${abs} min` : `${Math.floor(abs / 60)} h${abs % 60 ? ` ${abs % 60} min` : ''}`;
  return minutes >= 0 ? `in ${text}` : `${text} ago`;
};

/** "35 min before pickup", "10 min after pickup". */
export const beforePickup = (minutes: number) =>
  minutes >= 0 ? `${formatRelative(minutes).replace('in ', '')} before pickup` : `${formatRelative(minutes).replace(' ago', '')} after pickup`;

const RELEASE_LABEL: Record<string, string> = {
  Released: 'cancelled the reservation',
  Declined: 'declined the trip request',
  NoReply: "didn't answer the trip request",
  NotApproved: 'was removed (not approved)',
  NotStarted: "didn't start in time",
  CancelledTrip: 'cancelled the trip after Navigate',
  Reassigned: 'was replaced by an approver',
};

export type HistoryItem = { at: string; text: string; tone: 'info' | 'success' | 'warn' | 'danger' | 'muted' };

/** The reservation's story, oldest first, from the times TOK keeps on it. */
export const historyOf = (r: Reservation): HistoryItem[] => {
  const items: HistoryItem[] = [];
  if (r.createdOn) items.push({ at: r.createdOn, text: 'Booked by the passenger', tone: 'info' });
  (r.releases ?? []).forEach(x =>
    items.push({
      at: x.atUtc,
      text: `Driver ${x.driverId} ${RELEASE_LABEL[x.reason] ?? x.reason} · ${beforePickup(x.minutesBeforePickup)}${x.isLate ? ' · late' : ''}`,
      tone: x.reason === 'Reassigned' ? 'muted' : 'danger',
    }),
  );
  if (r.driverAcceptedAtUtc && r.assignedDriver) {
    items.push({ at: r.driverAcceptedAtUtc, text: `Held by ${r.assignedDriver.name || r.assignedDriver.driverId}`, tone: 'success' });
  }
  if (r.reminderSentAtUtc) items.push({ at: r.reminderSentAtUtc, text: 'Gentle reminder sent', tone: 'info' });
  if (r.finalReminderSentAtUtc) items.push({ at: r.finalReminderSentAtUtc, text: 'Final reminder sent (not started)', tone: 'warn' });
  if (r.navigateAtUtc) items.push({ at: r.navigateAtUtc, text: 'Driver tapped Navigate to Customer', tone: 'success' });
  if (r.lastDispatchAtUtc && (r.dispatchRound ?? 0) > 0) {
    items.push({ at: r.lastDispatchAtUtc, text: `Sent to nearby drivers (round ${r.dispatchRound})`, tone: 'warn' });
  }
  if (r.delayNotifiedAtUtc) items.push({ at: r.delayNotifiedAtUtc, text: 'Passenger told: having difficulty finding a driver', tone: 'warn' });
  if (r.cancelledAtUtc) {
    items.push({
      at: r.cancelledAtUtc,
      text: `Cancelled by the passenger${r.cancelledMinutesBeforePickup != null ? ` · ${beforePickup(r.cancelledMinutesBeforePickup)}` : ''}${r.cancelReason ? ` · "${r.cancelReason}"` : ''}`,
      tone: 'muted',
    });
  }
  if (r.noShowAtUtc) items.push({ at: r.noShowAtUtc, text: 'Driver marked the passenger as a no-show', tone: 'danger' });
  if (r.failedAtUtc) items.push({ at: r.failedAtUtc, text: 'No driver found; passenger told, not charged', tone: 'danger' });
  return items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
};
