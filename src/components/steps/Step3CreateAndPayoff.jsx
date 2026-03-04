import { useState } from 'react';
import { useRefinance } from '../../context/RefinanceContext';
import LoanCard from '../shared/LoanCard';
import AccountCard from '../shared/AccountCard';
import StateTimeline from '../shared/StateTimeline';
import LedgerVisualization from '../LedgerVisualization';
import ApiCallPanel from '../ApiCallPanel';
import { formatMoney } from '../shared/format';
import { MOCK_EXISTING_LOAN } from '../../data/mockData';

export default function Step3CreateAndPayoff() {
  const {
    existingLoan,
    selectedOffer,
    newLoan,
    newLoanAccount,
    payoffTransaction,
    ledgerEntries,
    apiCalls,
    completedSteps,
    termsAccepted,
    acceptTerms,
  } = useRefinance();

  const [showDetails, setShowDetails] = useState(false);
  const isCompleted = completedSteps.includes(3);
  const originalBalance = MOCK_EXISTING_LOAN.balance;

  if (!isCompleted) {
    const offer = selectedOffer;
    const netFunds = offer ? offer.principal - originalBalance : 0;
    const factorRate = offer ? (1 + offer.factorRateBps / 10000).toFixed(4) : '--';
    const apr = offer ? (offer.apr * 100).toFixed(2) : '--';
    const withholdingPct = offer ? (offer.swipeBps / 100).toFixed(2) : '--';
    const expectedMonths = offer ? Math.round(offer.expectedTermDays / 30) : '--';
    const maxMonths = offer ? Math.round(offer.maxTermDays / 30) : '--';

    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Step 3: Accept New Loan Agreement</h2>
          <p>
            Review the refinance terms below. Accepting creates the new loan and
            pays off your existing obligation of <strong>{formatMoney(originalBalance)}</strong>.
          </p>
        </div>

        {offer && (
          <>
            <div className="terms-section">
              <div className="terms-existing-obligation">
                <div className="terms-card-header">
                  <span className="terms-card-badge closing">Closing</span>
                  <h4>Existing Loan &mdash; {MOCK_EXISTING_LOAN.shortId}</h4>
                </div>
                <div className="terms-key-grid compact">
                  <div className="terms-key-row">
                    <span className="terms-label">Current Balance</span>
                    <span className="terms-value">{formatMoney(originalBalance)}</span>
                  </div>
                  <div className="terms-key-row">
                    <span className="terms-label">Original Loan</span>
                    <span className="terms-value muted">
                      {formatMoney(MOCK_EXISTING_LOAN.principal)} principal + {formatMoney(MOCK_EXISTING_LOAN.interest)} fee
                    </span>
                  </div>
                </div>
                <div className="terms-status-note">
                  This loan will be <strong>paid in full</strong> and transitioned to <strong>PAID_CLOSED</strong>.
                </div>
              </div>

              <div className="terms-arrow-divider">
                <div className="terms-arrow-line" />
                <div className="terms-arrow-label">Refinanced into</div>
                <div className="terms-arrow-line" />
              </div>

              <div className="terms-new-loan">
                <div className="terms-card-header">
                  <span className="terms-card-badge new">New Agreement</span>
                  <h4>Refinance Loan Terms</h4>
                </div>
                <div className="terms-key-grid">
                  <div className="terms-key-row">
                    <span className="terms-label">New Principal</span>
                    <span className="terms-value large">{formatMoney(offer.principal)}</span>
                  </div>
                  <div className="terms-key-row">
                    <span className="terms-label">Fee</span>
                    <span className="terms-value">{formatMoney(offer.interest)}</span>
                  </div>
                  <div className="terms-key-row highlight">
                    <span className="terms-label">Total Obligation</span>
                    <span className="terms-value large">{formatMoney(offer.total)}</span>
                  </div>
                  <div className="terms-divider" />
                  <div className="terms-key-row">
                    <span className="terms-label">Factor Rate</span>
                    <span className="terms-value">{factorRate}</span>
                  </div>
                  <div className="terms-key-row">
                    <span className="terms-label">APR</span>
                    <span className="terms-value">{apr}%</span>
                  </div>
                  <div className="terms-divider" />
                  <div className="terms-key-row">
                    <span className="terms-label">Payment Method</span>
                    <span className="terms-value">Daily withholding at {withholdingPct}% of card volume</span>
                  </div>
                  <div className="terms-key-row">
                    <span className="terms-label">30-Day Minimum</span>
                    <span className="terms-value">{formatMoney(offer.minPeriodAmount)}</span>
                  </div>
                  <div className="terms-key-row">
                    <span className="terms-label">Expected Term</span>
                    <span className="terms-value">~{expectedMonths} months</span>
                  </div>
                  <div className="terms-key-row">
                    <span className="terms-label">Max Term</span>
                    <span className="terms-value">{maxMonths} months</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="terms-net-funds">
              <div className="terms-net-funds-row">
                <div className="terms-net-item">
                  <span className="terms-net-label">Payoff Existing Loan</span>
                  <span className="terms-net-amount debit">&minus;{formatMoney(originalBalance)}</span>
                </div>
                <div className="terms-net-divider" />
                <div className="terms-net-item">
                  <span className="terms-net-label">Disbursed to You via RTP</span>
                  <span className="terms-net-amount credit">{formatMoney(netFunds)}</span>
                </div>
              </div>
            </div>

            <div className="terms-disclosure">
              <h4>Refinance Authorization</h4>
              <ul className="terms-disclosure-list">
                <li>Your existing loan balance of <strong>{formatMoney(originalBalance)}</strong> will be paid in full and the loan closed</li>
                <li>A new loan with a total obligation of <strong>{formatMoney(offer.total)}</strong> will be created</li>
                <li>Daily payments will be withheld from your card processing at <strong>{withholdingPct}%</strong></li>
                <li>You must meet the minimum payment of <strong>{formatMoney(offer.minPeriodAmount)}</strong> every 30 days</li>
              </ul>
              <label className={`terms-checkbox ${termsAccepted ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => { if (!termsAccepted) acceptTerms(); }}
                />
                <span className="terms-checkbox-text">
                  I have reviewed and accept the refinance terms and authorize Jaris to pay off
                  my existing loan and create a new loan agreement.
                </span>
              </label>
            </div>

            <div className="terms-behind-scenes">
              <button
                className="terms-toggle-btn"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? '▾' : '▸'} What happens behind the scenes
              </button>
              {showDetails && (
                <ol className="terms-operations-list">
                  <li>Create refinance child loan (Loan Service)</li>
                  <li>Open FinXact ledger account</li>
                  <li>Approve the new loan</li>
                  <li>Calculate early payoff discount</li>
                  <li>Pay off existing loan in full</li>
                  <li>Old loan &rarr; PAID_CLOSED</li>
                </ol>
              )}
            </div>
          </>
        )}

        {!offer && (
          <div className="terms-no-offer">
            <p>Please go back to Step 2 and select a refinance offer to continue.</p>
          </div>
        )}
      </div>
    );
  }

  const step3Entries = ledgerEntries.filter(e => e.step === 3);

  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Step 3: Create Refinance Loan & Payoff</h2>
        <p className="success-text">
          Refinance loan created and existing loan paid off. The new loan is
          in <strong>APPROVED</strong> state and the old loan is <strong>PAID_CLOSED</strong> with
          a $0.00 balance.
        </p>
      </div>

      {newLoan && <StateTimeline currentState={newLoan.state} label="New Loan State" />}

      <div className="two-column">
        <LoanCard loan={existingLoan} label="Existing Loan (PAID_CLOSED)" dimmed />
        <LoanCard loan={newLoan} label="New Refinance Loan (Child)" />
      </div>

      {newLoanAccount && (
        <div className="section">
          <h3>FinXact Loan Account</h3>
          <AccountCard account={newLoanAccount} type="finxact" />
        </div>
      )}

      <div className="payoff-comparison">
        <div className="payoff-before">
          <h4>Before Payoff</h4>
          <div className="payoff-stat">
            <span>Balance</span>
            <span className="amount">{formatMoney(originalBalance)}</span>
          </div>
          <div className="payoff-stat">
            <span>Principal</span>
            <span>{formatMoney(MOCK_EXISTING_LOAN.principalBalance)}</span>
          </div>
          <div className="payoff-stat">
            <span>Fee</span>
            <span>{formatMoney(MOCK_EXISTING_LOAN.interestBalance)}</span>
          </div>
          <div className="payoff-stat">
            <span>State</span>
            <span className="state-badge normal">NORMAL</span>
          </div>
        </div>
        <div className="payoff-arrow-large">&#8594;</div>
        <div className="payoff-after">
          <h4>After Payoff</h4>
          <div className="payoff-stat">
            <span>Balance</span>
            <span className="amount zero">{formatMoney(0)}</span>
          </div>
          <div className="payoff-stat">
            <span>Principal</span>
            <span>{formatMoney(0)}</span>
          </div>
          <div className="payoff-stat">
            <span>Fee</span>
            <span>{formatMoney(0)}</span>
          </div>
          <div className="payoff-stat">
            <span>State</span>
            <span className="state-badge paid-closed">{existingLoan?.state}</span>
          </div>
        </div>
      </div>

      {payoffTransaction && (
        <div className="section">
          <h3>Payoff Transaction</h3>
          <div className="tx-detail-card">
            <div className="tx-detail-row">
              <span>Type</span><span>{payoffTransaction.type}</span>
            </div>
            <div className="tx-detail-row">
              <span>Method</span><span>{payoffTransaction.method}</span>
            </div>
            <div className="tx-detail-row">
              <span>Amount</span><span className="bold">{formatMoney(payoffTransaction.amount)}</span>
            </div>
            <div className="tx-detail-row">
              <span>Principal</span><span>{formatMoney(payoffTransaction.principal)}</span>
            </div>
            <div className="tx-detail-row">
              <span>Fee</span><span>{formatMoney(payoffTransaction.interest)}</span>
            </div>
            <div className="tx-detail-row">
              <span>Status</span><span className="tx-status settled">{payoffTransaction.status}</span>
            </div>
          </div>
        </div>
      )}

      <LedgerVisualization entries={step3Entries} title="Ledger Entries - Loan Creation & Payoff" />
      <ApiCallPanel calls={apiCalls} step={3} />
    </div>
  );
}
