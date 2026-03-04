import { useRefinance } from '../../context/RefinanceContext';
import LoanCard from '../shared/LoanCard';
import StateTimeline from '../shared/StateTimeline';
import LedgerVisualization from '../LedgerVisualization';
import ApiCallPanel from '../ApiCallPanel';
import { formatMoney, formatDate } from '../shared/format';
import { MOCK_EXISTING_LOAN } from '../../data/mockData';

function getNextBusinessDay(fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function getProjectedPayoffDate(signingDate, expectedTermDays) {
  const d = new Date(signingDate);
  d.setDate(d.getDate() + expectedTermDays);
  return d;
}

export default function Step5Summary() {
  const {
    existingLoan,
    newLoan,
    selectedOffer,
    selectedBankAccount,
    payoffTransaction,
    fundingTransaction,
    ledgerEntries,
    apiCalls,
  } = useRefinance();

  const payoffAmount = MOCK_EXISTING_LOAN.balance;
  const disbursementAmount = (selectedOffer?.principal || 18000) - payoffAmount;
  const interestFee = selectedOffer?.interest || 2700;
  const totalObligation = selectedOffer?.total || 20700;
  const lastFour = selectedBankAccount?.lastFour || '8437';

  // Borrower experience data
  const nextPaymentDate = getNextBusinessDay();
  const withholdingRate = (selectedOffer?.swipeBps || 600) / 10000; // e.g. 0.06 for 6%
  const assumedDailyRevenue = 1200; // reasonable daily card revenue for small business
  const estimatedDailyPayment = assumedDailyRevenue * withholdingRate;
  const projectedPayoffDate = newLoan
    ? getProjectedPayoffDate(newLoan.signingDate || new Date().toISOString(), selectedOffer?.expectedTermDays || 270)
    : null;
  const maxPayoffDate = newLoan
    ? new Date(newLoan.finalDueDate)
    : null;
  const monthlyMin = selectedOffer?.minPeriodAmount || 1150;
  const feeRatio = selectedOffer ? selectedOffer.interest / selectedOffer.total : 0.1304;
  const dailyFeeComponent = estimatedDailyPayment * feeRatio;
  const dailyPrincipalComponent = estimatedDailyPayment - dailyFeeComponent;

  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Step 5: Refinance Summary</h2>
        <p className="success-text">
          The refinance is complete. The existing loan has been paid off and the merchant
          received <strong>{formatMoney(disbursementAmount)}</strong> in their bank account.
        </p>
      </div>

      <div className="summary-breakdown">
        <h3>Refinance Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="breakdown-label">New Loan Principal</span>
            <span className="breakdown-value">{formatMoney(selectedOffer?.principal)}</span>
          </div>
          <div className="breakdown-divider" />
          <div className="breakdown-item indent">
            <span className="breakdown-label">Old Loan Payoff (Txn 1)</span>
            <span className="breakdown-value debit">-{formatMoney(payoffAmount)}</span>
          </div>
          <div className="breakdown-item indent">
            <span className="breakdown-label">Disbursed to Merchant via RTP (Txn 2)</span>
            <span className="breakdown-value debit">-{formatMoney(disbursementAmount)}</span>
          </div>
          <div className="breakdown-divider" />
          <div className="breakdown-item">
            <span className="breakdown-label">Fee</span>
            <span className="breakdown-value">{formatMoney(interestFee)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Factor Rate</span>
            <span className="breakdown-value">
              {selectedOffer ? (1 + selectedOffer.factorRateBps / 10000).toFixed(4) : '--'}
            </span>
          </div>
          <div className="breakdown-divider bold" />
          <div className="breakdown-item total">
            <span className="breakdown-label">Total New Obligation</span>
            <span className="breakdown-value">{formatMoney(totalObligation)}</span>
          </div>
          <div className="breakdown-item highlight">
            <span className="breakdown-label">Net Funds to Merchant</span>
            <span className="breakdown-value">{formatMoney(disbursementAmount)}</span>
          </div>
        </div>
      </div>

      <div className="borrower-experience-section">
        <h3>Borrower Experience &mdash; What&rsquo;s Next</h3>
        <p className="section-desc">
          After refinance closes, here&rsquo;s what the borrower sees going forward. Payment amounts fluctuate
          daily based on card processing volume at the configured withholding rate.
        </p>

        <div className="bx-grid">
          <div className="bx-card next-payment">
            <div className="bx-card-icon">&#x1F4C5;</div>
            <div className="bx-card-content">
              <div className="bx-card-label">Next Expected Payment</div>
              <div className="bx-card-value">{formatDate(nextPaymentDate.toISOString())}</div>
              <div className="bx-card-sublabel">Next business day &middot; Daily withholding from card swipes</div>
            </div>
            <div className="bx-api-tag">
              <code>GET /loan/v1/loans/{'{'}loanId{'}'}</code>
              <span className="bx-api-note">Derived from latestPaymentDate + payment frequency</span>
            </div>
          </div>

          <div className="bx-card daily-estimate">
            <div className="bx-card-icon">&#x1F4B3;</div>
            <div className="bx-card-content">
              <div className="bx-card-label">Estimated Daily Withholding</div>
              <div className="bx-card-value">{formatMoney(estimatedDailyPayment)}</div>
              <div className="bx-card-detail-row">
                <span>Principal: {formatMoney(dailyPrincipalComponent)}</span>
                <span>Fee: {formatMoney(dailyFeeComponent)}</span>
              </div>
              <div className="bx-card-sublabel">
                Based on {formatMoney(assumedDailyRevenue)}/day card revenue &times; {(withholdingRate * 100).toFixed(2)}% withholding
              </div>
            </div>
            <div className="bx-api-tag">
              <code>POST /loan/v1/loans/{'{'}loanId{'}'}/calculate-withholding</code>
              <span className="bx-api-note">Calculates exact withholding for a given transaction amount</span>
            </div>
          </div>

          <div className="bx-card min-payment">
            <div className="bx-card-icon">&#x1F4CA;</div>
            <div className="bx-card-content">
              <div className="bx-card-label">30-Day Minimum Payment</div>
              <div className="bx-card-value">{formatMoney(monthlyMin)}</div>
              <div className="bx-card-sublabel">
                Must meet this minimum each 30-day assessment period &middot; Collected daily from card swipes
              </div>
              <div className="bx-progress-row">
                <div className="bx-progress-bar">
                  <div className="bx-progress-fill" style={{ width: '0%' }} />
                </div>
                <span className="bx-progress-label">{formatMoney(0)} / {formatMoney(monthlyMin)} this period</span>
              </div>
            </div>
            <div className="bx-api-tag">
              <code>GET /loan/v1/loans/{'{'}loanId{'}'}/balance-periods</code>
              <span className="bx-api-note">Tracks period-to-date payments against minimum</span>
            </div>
          </div>

          <div className="bx-card payoff-date">
            <div className="bx-card-icon">&#x1F3C1;</div>
            <div className="bx-card-content">
              <div className="bx-card-label">Projected Payoff</div>
              <div className="bx-card-value">
                {projectedPayoffDate ? formatDate(projectedPayoffDate.toISOString()) : '--'}
              </div>
              <div className="bx-card-sublabel">
                ~{Math.round((selectedOffer?.expectedTermDays || 270) / 30)} months at average pace &middot;
                Max term: {maxPayoffDate ? formatDate(maxPayoffDate.toISOString()) : '--'}
              </div>
            </div>
            <div className="bx-api-tag">
              <code>GET /loan/v1/loans/{'{'}loanId{'}'}/calculate-discount</code>
              <span className="bx-api-note">Shows early payoff savings if borrower pays ahead of schedule</span>
            </div>
          </div>
        </div>

        <div className="bx-total-progress">
          <div className="bx-total-header">
            <span>Loan Repayment Progress</span>
            <span className="bx-total-pct">0%</span>
          </div>
          <div className="bx-total-bar">
            <div className="bx-total-fill" style={{ width: '0%' }} />
          </div>
          <div className="bx-total-labels">
            <span>{formatMoney(0)} repaid</span>
            <span>{formatMoney(totalObligation)} total obligation</span>
          </div>
        </div>
      </div>

      <div className="two-column">
        <div>
          <h3>Old Loan (Closed)</h3>
          <StateTimeline currentState={existingLoan?.state} label="" />
          <LoanCard loan={existingLoan} label="Existing Loan" dimmed />
        </div>
        <div>
          <h3>New Loan (Active)</h3>
          <StateTimeline currentState={newLoan?.state} label="" />
          <LoanCard loan={newLoan} label="Refinance Loan" />
        </div>
      </div>

      <div className="section">
        <h3>Transaction Timeline</h3>
        <div className="timeline-list">
          {payoffTransaction && (
            <div className="timeline-event">
              <div className="timeline-dot payoff" />
              <div className="timeline-event-content">
                <div className="timeline-event-title">
                  Transaction 1: Payoff Old Loan
                </div>
                <div className="timeline-event-detail">
                  {payoffTransaction.type} / {payoffTransaction.method} / {formatMoney(payoffTransaction.amount)}
                  <span className="tx-status settled">{payoffTransaction.status}</span>
                </div>
              </div>
            </div>
          )}
          {fundingTransaction && (
            <div className="timeline-event">
              <div className="timeline-dot funding" />
              <div className="timeline-event-content">
                <div className="timeline-event-title">
                  Transaction 2: RTP Disburse to Bank Account (*{lastFour})
                </div>
                <div className="timeline-event-detail">
                  {fundingTransaction.type} / {fundingTransaction.method} / {formatMoney(fundingTransaction.amount)}
                  <span className="tx-status settled">{fundingTransaction.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <LedgerVisualization entries={ledgerEntries} title="Complete Ledger - All Entries" showStepLabels />

      <div className="section">
        <h3>All API Calls ({apiCalls.length})</h3>
        <ApiCallPanel calls={apiCalls} />
      </div>
    </div>
  );
}
