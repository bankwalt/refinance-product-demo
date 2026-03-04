import { Fragment } from 'react';
import { formatMoney } from './shared/format';

const STEP_COLORS = {
  3: { bg: '#eff6ff', border: '#3b82f6', label: 'Loan Creation & Payoff' },
  4: { bg: '#faf5ff', border: '#8b5cf6', label: 'Disbursement' },
};

export default function LedgerVisualization({ entries, title, showStepLabels = true }) {
  if (!entries || entries.length === 0) return null;

  const totalDebits = entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredits = entries.reduce((sum, e) => sum + (e.credit || 0), 0);

  let currentStep = null;

  return (
    <div className="ledger-viz">
      {title && <h4 className="ledger-title">{title}</h4>}
      <table className="ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Account</th>
            <th className="amount-col">Debit</th>
            <th className="amount-col">Credit</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const stepInfo = STEP_COLORS[entry.step];
            let stepSeparator = null;

            if (showStepLabels && entry.step !== currentStep && stepInfo) {
              currentStep = entry.step;
              stepSeparator = (
                <tr key={`sep-${entry.step}`} className="step-separator">
                  <td colSpan={5}>
                    <span className="step-sep-badge" style={{ backgroundColor: stepInfo.border }}>
                      Step {entry.step}: {stepInfo.label}
                    </span>
                  </td>
                </tr>
              );
            }

            return (
              <Fragment key={entry.id}>
                {stepSeparator}
                <tr
                  className="ledger-row"
                  style={{ backgroundColor: stepInfo?.bg || 'transparent' }}
                >
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td>
                    <span className="ledger-account-badge">{entry.account}</span>
                  </td>
                  <td className="amount-col debit">
                    {entry.debit > 0 ? formatMoney(entry.debit) : ''}
                  </td>
                  <td className="amount-col credit">
                    {entry.credit > 0 ? formatMoney(entry.credit) : ''}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="ledger-totals">
            <td colSpan={3}>Totals</td>
            <td className="amount-col debit">{formatMoney(totalDebits)}</td>
            <td className="amount-col credit">{formatMoney(totalCredits)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
