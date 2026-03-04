export const LOAN_STATES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'PENDING_FUNDING',
  'PENDING_NORMAL',
  'NORMAL',
  'PRE_DEFAULT',
  'DEFAULT',
  'PAID',
  'PAID_CLOSED',
];

export const LOAN_STATE_COLORS = {
  PENDING_APPROVAL: '#f59e0b',
  APPROVED: '#3b82f6',
  PENDING_FUNDING: '#8b5cf6',
  PENDING_NORMAL: '#6366f1',
  NORMAL: '#22c55e',
  PRE_DEFAULT: '#f97316',
  DEFAULT: '#dc2626',
  PAID: '#14b8a6',
  PAID_CLOSED: '#64748b',
  OVER_PAID: '#0ea5e9',
  CANCELED: '#9ca3af',
  REJECTED: '#ef4444',
  FUNDING_FAILED: '#ef4444',
  WORKOUT: '#a855f7',
  CHARGE_OFF: '#991b1b',
  TECHNICAL_DEFAULT: '#b91c1c',
};

export const LOAN_STATE_LABELS = {
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  PENDING_FUNDING: 'Pending Funding',
  PENDING_NORMAL: 'Pending Normal',
  NORMAL: 'Normal',
  PRE_DEFAULT: 'Pre-Default',
  DEFAULT: 'Default',
  PAID: 'Paid',
  PAID_CLOSED: 'Paid & Closed',
  OVER_PAID: 'Over Paid',
};

export const TRANSACTION_TYPES = {
  FUNDING: { label: 'Funding', color: '#3b82f6' },
  PREPAY: { label: 'Prepayment', color: '#22c55e' },
  WITHHOLDING: { label: 'Withholding', color: '#8b5cf6' },
  INSTALLMENT: { label: 'Installment', color: '#6366f1' },
  RECOVERY: { label: 'Recovery', color: '#f97316' },
  REFUND: { label: 'Refund', color: '#ef4444' },
  FORGIVENESS: { label: 'Forgiveness', color: '#14b8a6' },
  DISCOUNT_REFUND: { label: 'Discount Refund', color: '#0ea5e9' },
  INTEREST_ORIGINATION: { label: 'Interest Origination', color: '#a855f7' },
  ADJUSTMENT: { label: 'Adjustment', color: '#64748b' },
  BALANCE_TRANSFER: { label: 'Balance Transfer', color: '#d946ef' },
  OUT_OF_BAND: { label: 'Out of Band', color: '#78716c' },
  BOOK: { label: 'Book', color: '#475569' },
};

export const TRANSACTION_METHODS = {
  ACH: 'ACH',
  RTP: 'RTP',
  FEDNOW: 'FedNow',
  WIRE: 'Wire',
  JOURNAL: 'Journal',
  NON_CASH: 'Non-Cash',
  CHECK: 'Check',
  CARD: 'Card',
  OCT: 'OCT',
};

export function getStateIndex(state) {
  return LOAN_STATES.indexOf(state);
}

export function isTerminalState(state) {
  return ['PAID', 'PAID_CLOSED', 'OVER_PAID', 'CANCELED', 'REJECTED', 'CHARGE_OFF'].includes(state);
}
