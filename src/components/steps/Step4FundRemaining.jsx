import { useState } from 'react';
import { useRefinance } from '../../context/RefinanceContext';
import LoanCard from '../shared/LoanCard';
import AccountCard from '../shared/AccountCard';
import StateTimeline from '../shared/StateTimeline';
import LedgerVisualization from '../LedgerVisualization';
import ApiCallPanel from '../ApiCallPanel';
import PlaidRelinkModal from '../PlaidRelinkModal';
import { formatMoney } from '../shared/format';
import { MOCK_EXISTING_LOAN, isBankAccountStale } from '../../data/mockData';

export default function Step4FundRemaining() {
  const {
    selectedOffer,
    selectedBankAccount,
    newLoan,
    newLoanAccount,
    fundingTransaction,
    paymentOrder,
    ledgerEntries,
    apiCalls,
    completedSteps,
    plaidRelinkState,
  } = useRefinance();

  const [showPlaidModal, setShowPlaidModal] = useState(false);

  const isCompleted = completedSteps.includes(4);
  const disbursementAmount = (selectedOffer?.principal || 18000) - MOCK_EXISTING_LOAN.balance;
  const lastFour = selectedBankAccount?.lastFour || '8437';
  const isStale = selectedBankAccount && isBankAccountStale(selectedBankAccount);

  if (!isCompleted) {
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Step 4: Fund Remaining to Borrower</h2>
          <p>
            <strong>Transaction 2:</strong> After paying off the existing loan, the remaining{' '}
            <strong>{formatMoney(disbursementAmount)}</strong> is disbursed to the
            merchant's bank account (*{lastFour}) via RTP/FedNow real-time payment.
          </p>
          <ol className="step-actions-list">
            <li>Create FinXact funding payment for {formatMoney(disbursementAmount)}</li>
            <li>Create RTP payment order (CREDIT direction)</li>
            <li>Record funding payment on Loan Service</li>
            <li>New loan transitions to <strong>NORMAL</strong> state</li>
          </ol>
        </div>

        {isStale && plaidRelinkState !== 'relinked' && (
          <div className="stale-warning">
            <div className="stale-warning-icon">!</div>
            <div className="stale-warning-content">
              <h4>Bank Account Verification Expired</h4>
              <p>
                The selected bank account ({selectedBankAccount.bankName} *{selectedBankAccount.lastFour})
                was last verified on {new Date(selectedBankAccount.lastVerifiedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })},
                which is more than 12 months ago. Re-authentication via Plaid is required before
                disbursement can proceed.
              </p>
              <button className="btn btn-action" onClick={() => setShowPlaidModal(true)}>
                Re-authenticate via Plaid
              </button>
            </div>
          </div>
        )}

        {plaidRelinkState === 'relinked' && (
          <div className="reauth-success">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Bank account re-authenticated successfully. You may now proceed with funding.
          </div>
        )}

        <div className="payoff-preview">
          <div className="payoff-flow">
            <div className="flow-box source">
              <div className="flow-label">New Loan</div>
              <div className="flow-amount">{formatMoney(disbursementAmount)}</div>
            </div>
            <div className="flow-arrow">&#8594;</div>
            <div className="flow-box destination bank">
              <div className="flow-label">Bank Account (*{lastFour})</div>
              <div className="flow-amount">{formatMoney(disbursementAmount)}</div>
              <div className="flow-method">via RTP/FedNow</div>
            </div>
          </div>
        </div>

        {showPlaidModal && selectedBankAccount && (
          <PlaidRelinkModal
            account={selectedBankAccount}
            onClose={() => setShowPlaidModal(false)}
          />
        )}
      </div>
    );
  }

  const step4Entries = ledgerEntries.filter(e => e.step === 4);

  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Step 4: Fund Remaining to Borrower</h2>
        <p className="success-text">
          <strong>{formatMoney(disbursementAmount)}</strong> has been disbursed via RTP to the
          merchant's bank account (*{lastFour}). The new loan is now <strong>NORMAL</strong>.
        </p>
      </div>

      {newLoan && <StateTimeline currentState={newLoan.state} label="New Loan State" />}

      <div className="two-column">
        <LoanCard loan={newLoan} label="New Refinance Loan" />
        <div>
          {newLoanAccount && <AccountCard account={newLoanAccount} type="finxact" />}
          <div style={{ marginTop: '1rem' }}>
            <AccountCard account={selectedBankAccount} type="bank" />
          </div>
        </div>
      </div>

      {paymentOrder && (
        <div className="section">
          <h3>Payment Order</h3>
          <div className="tx-detail-card">
            <div className="tx-detail-row">
              <span>Order ID</span><span className="mono">{paymentOrder.id}</span>
            </div>
            <div className="tx-detail-row">
              <span>Network</span><span>{paymentOrder.network}</span>
            </div>
            <div className="tx-detail-row">
              <span>Direction</span><span>{paymentOrder.direction}</span>
            </div>
            <div className="tx-detail-row">
              <span>Amount</span><span className="bold">{formatMoney(paymentOrder.amount)}</span>
            </div>
            <div className="tx-detail-row">
              <span>Status</span><span className="tx-status settled">{paymentOrder.status}</span>
            </div>
          </div>
        </div>
      )}

      <LedgerVisualization entries={step4Entries} title="Ledger Entries - Disbursement" />
      <ApiCallPanel calls={apiCalls} step={4} />
    </div>
  );
}
