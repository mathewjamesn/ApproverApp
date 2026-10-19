import { useSyncExternalStore } from 'react';
import { APPLICANTS, REJECTED, STEPS, type Rejected, type Step } from './data';

/** Everything the prototype remembers while it runs. Nothing is sent anywhere. */
export type Env = 'PROD' | 'STG';
export type CheckState = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Review = Record<Step, { s: CheckState; r: string }>;

export type State = {
  signedIn: boolean;
  env: Env;
  /** Applicant ids still waiting, oldest last (same order as the queue). */
  pending: string[];
  review: Record<string, Review>;
  rejected: Rejected[];
  driverBlocked: boolean;
  driverDeleted: boolean;
  paymentApproved: boolean;
  passengerBlocked: boolean;
  passengerDeleted: boolean;
  airportPct: number;
  /** Fare changes applied in the prototype, newest first. */
  fareChanges: string[];
  toast: string | null;
};

const freshReview = (): Record<string, Review> =>
  Object.fromEntries(APPLICANTS.map(a => [a.id, Object.fromEntries(STEPS.map(k => [k, { s: 'PENDING', r: '' }])) as Review]));

export function initialState(): State {
  const review = freshReview();
  // One check already done, so the queue shows progress.
  review.d1.profile = { s: 'APPROVED', r: '' };
  return {
    signedIn: false,
    env: 'PROD',
    pending: APPLICANTS.map(a => a.id),
    review,
    rejected: REJECTED,
    driverBlocked: false,
    driverDeleted: false,
    paymentApproved: false,
    passengerBlocked: false,
    passengerDeleted: false,
    airportPct: 12,
    fareChanges: [],
    toast: null,
  };
}

let state: State = initialState();
const listeners = new Set<() => void>();
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach(l => l());
  },
  reset(patch: Partial<State> = {}) {
    state = { ...initialState(), ...patch };
    listeners.forEach(l => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => select(state), () => select(state));
}

/** Short confirmation at the bottom of the screen. */
export function toast(message: string) {
  store.set({ toast: message });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => store.set({ toast: null }), 2400);
}

export function setCheck(id: string, step: Step, s: CheckState, r = '') {
  const review = { ...state.review, [id]: { ...state.review[id], [step]: { s, r } } };
  store.set({ review });
}

export const checkedCount = (rv: Review) => STEPS.filter(k => rv[k].s !== 'PENDING').length;
export const firstPending = (rv: Review): Step | undefined => STEPS.find(k => rv[k].s === 'PENDING');
