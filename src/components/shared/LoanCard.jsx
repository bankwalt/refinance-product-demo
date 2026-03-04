import { LOAN_STATE_COLORS, LOAN_STATE_LABELS } from '../../data/loanStates';
import { formatMoney, formatDate } from './format';

export default function LoanCard({ loan, label, dimmed = false }) {
  if (!loan) return null;

  const stateColor = LOAN_STATE_COLORS[loan.state] || '#64748b';
  const stateLabel = LOAN_STATE_LABELS[loan.state] || loan.state;

  return (
    <div className={`loan-card ${dimmed ? 'dimmed' : ''}`}>
      {label && <div className="loan-card-label">{label}</div>}
      <div className="loan-card-header">
        <span className="loan-short-id">{loan.shortId}</span>
        <span className="loan-state-badge" style={{ backgroundColor: stateColor }}>
          {stateLabel}
        </span>
      </div>
      <div className="loan-card-type">{loan.loanType?.replace(/_/g, ' ')}</div>
      <div className="loan-card-grid">
        <div className="loan-field">
          <span className="field-label">Principal</span>
          <span className="field-value">{formatMoney(loan.principal)}</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Fee</span>
          <span className="field-value">{formatMoney(loan.interest)}</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Total</span>
          <span className="field-value bold">{formatMoney(loan.total)}</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Balance</span>
          <span className={`field-value bold ${loan.balance === 0 ? 'zero' : ''}`}>
            {formatMoney(loan.balance)}
          </span>
        </div>
        {loan.factorRateBps != null && (
          <div className="loan-field">
            <span className="field-label">Factor Rate</span>
            <span className="field-value">{(1 + loan.factorRateBps / 10000).toFixed(4)}</span>
          </div>
        )}
        {loan.apr != null && (
          <div className="loan-field">
            <span className="field-label">APR</span>
            <span className="field-value">{(loan.apr * 100).toFixed(2)}%</span>
          </div>
        )}
        <div className="loan-field">
          <span className="field-label">Principal Balance</span>
          <span className="field-value">{formatMoney(loan.principalBalance)}</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Fee Balance</span>
          <span className="field-value">{formatMoney(loan.interestBalance)}</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Withholding Rate</span>
          <span className="field-value">{(loan.swipeBps / 100).toFixed(2)}%</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Payment Frequency</span>
          <span className="field-value">Daily</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Min Monthly Payment</span>
          <span className="field-value">{formatMoney(loan.minPeriodAmount)}</span>
        </div>
        {loan.expectedTermDays && (
          <div className="loan-field">
            <span className="field-label">Expected Term</span>
            <span className="field-value">{Math.round(loan.expectedTermDays / 30)} months</span>
          </div>
        )}
        <div className="loan-field">
          <span className="field-label">Max Term</span>
          <span className="field-value">{Math.round(loan.maxTermDays / 30)} months</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Signed</span>
          <span className="field-value">{formatDate(loan.signingDate || loan.signedAt)}</span>
        </div>
        <div className="loan-field">
          <span className="field-label">Final Due</span>
          <span className="field-value">{formatDate(loan.finalDueDate)}</span>
        </div>
      </div>
      {loan.modificationParentId && (
        <div className="loan-card-footer">
          Refinanced from: <code>{loan.modificationParentId.slice(0, 8)}...</code>
        </div>
      )}
      {loan.modificationChildId && (
        <div className="loan-card-footer">
          Refinanced to: <code>{loan.modificationChildId.slice(0, 8)}...</code>
        </div>
      )}
    </div>
  );
}
