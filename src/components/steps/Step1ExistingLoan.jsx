import { useEffect } from 'react';
import { useRefinance } from '../../context/RefinanceContext';
import LoanCard from '../shared/LoanCard';
import AccountCard from '../shared/AccountCard';
import StateTimeline from '../shared/StateTimeline';
import TransactionRow from '../shared/TransactionRow';
import ApiCallPanel from '../ApiCallPanel';

export default function Step1ExistingLoan() {
  const {
    existingLoan,
    existingLoanAccount,
    existingLoanTransactions,
    completedSteps,
    apiCalls,
    executeStep1,
  } = useRefinance();

  useEffect(() => {
    if (!completedSteps.includes(1) && !existingLoan) {
      executeStep1();
    }
  }, []);

  if (!existingLoan) {
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Step 1: Review Existing Loan</h2>
          <p>Loading existing loan details...</p>
        </div>
        <div className="loading-placeholder">
          <span className="spinner large" />
          <p>Fetching loan data from Loan Service and FinXact...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Step 1: Review Existing Loan</h2>
        <p>
          The merchant has an active loan with a remaining balance of{' '}
          <strong>${existingLoan.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>.
          This is the loan that will be refinanced.
        </p>
      </div>

      <StateTimeline currentState={existingLoan.state} label="Loan State" />

      <div className="two-column">
        <LoanCard loan={existingLoan} label="Existing Loan" />
        <AccountCard account={existingLoanAccount} type="finxact" />
      </div>

      {existingLoanTransactions.length > 0 && (
        <div className="section">
          <h3>Transaction History</h3>
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Method</th>
                <th className="amount">Amount</th>
                <th className="amount">Principal</th>
                <th className="amount">Fee</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {existingLoanTransactions.map(tx => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApiCallPanel calls={apiCalls} step={1} />
    </div>
  );
}
