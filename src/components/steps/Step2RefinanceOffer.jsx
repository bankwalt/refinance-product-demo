import { useEffect } from 'react';
import { useRefinance } from '../../context/RefinanceContext';
import AccountCard from '../shared/AccountCard';
import ApiCallPanel from '../ApiCallPanel';
import { formatMoney } from '../shared/format';

export default function Step2RefinanceOffer() {
  const {
    existingLoan,
    offers,
    selectedOffer,
    merchantBankAccounts,
    selectedBankAccount,
    completedSteps,
    apiCalls,
    selectOffer,
    selectBankAccount,
    executeStep2,
  } = useRefinance();

  useEffect(() => {
    if (!completedSteps.includes(2) && offers.length === 0) {
      executeStep2();
    }
  }, []);

  if (offers.length === 0) {
    return (
      <div className="step-content">
        <div className="step-header">
          <h2>Step 2: Refinance Offers</h2>
          <p>Loading available refinance offers...</p>
        </div>
        <div className="loading-placeholder">
          <span className="spinner large" />
        </div>
      </div>
    );
  }

  const existingBalance = existingLoan?.balance || 5000;

  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Step 2: Refinance Offers</h2>
        <p>
          Two refinance offers are available. Each exceeds the existing loan balance
          of <strong>{formatMoney(existingBalance)}</strong>, allowing payoff plus additional funds to the merchant.
        </p>
      </div>

      <div className="offers-grid">
        {offers.map(offer => {
          const isSelected = selectedOffer?.id === offer.id;
          const surplus = offer.principal - existingBalance;

          return (
            <button
              key={offer.id}
              className={`offer-card ${isSelected ? 'selected' : ''}`}
              onClick={() => selectOffer(offer)}
            >
              {isSelected && <div className="offer-selected-badge">Selected</div>}
              <div className="offer-label">{offer.label}</div>
              <div className="offer-amount">{formatMoney(offer.principal)}</div>
              <div className="offer-key-rates">
                <div className="offer-rate">
                  <span className="rate-label">Factor Rate</span>
                  <span className="rate-value">{(1 + offer.factorRateBps / 10000).toFixed(4)}</span>
                </div>
                <div className="offer-rate">
                  <span className="rate-label">APR</span>
                  <span className="rate-value">{(offer.apr * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div className="offer-detail-grid">
                <div className="offer-detail">
                  <span>Fee</span>
                  <span>{formatMoney(offer.interest)}</span>
                </div>
                <div className="offer-detail">
                  <span>Total Owed</span>
                  <span className="bold">{formatMoney(offer.total)}</span>
                </div>
                <div className="offer-detail">
                  <span>Withholding</span>
                  <span>{(offer.swipeBps / 100).toFixed(2)}%</span>
                </div>
                <div className="offer-detail">
                  <span>Payments</span>
                  <span>Daily</span>
                </div>
                <div className="offer-detail">
                  <span>Max Term</span>
                  <span>{Math.round(offer.maxTermDays / 30)} months</span>
                </div>
                <div className="offer-detail">
                  <span>Min Monthly</span>
                  <span>{formatMoney(offer.minPeriodAmount)}</span>
                </div>
              </div>
              <div className="offer-surplus">
                <span>Funds to Merchant After Payoff</span>
                <span className="surplus-amount">{formatMoney(surplus)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {existingLoan && selectedOffer && (
        <div className="comparison-table-wrapper">
          <h3>Terms Comparison</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Existing Loan</th>
                <th>Refinance Offer</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <CompRow label="Principal" old={existingLoan.principal} next={selectedOffer.principal} money />
              <CompRow label="Fee" old={existingLoan.interest} next={selectedOffer.interest} money />
              <CompRow label="Total" old={existingLoan.total} next={selectedOffer.total} money />
              <CompRow
                label="Factor Rate"
                old={1 + (existingLoan.factorRateBps || 1500) / 10000}
                next={1 + selectedOffer.factorRateBps / 10000}
                decimals={4}
              />
              <CompRow
                label="APR"
                old={(existingLoan.apr || 0.3499) * 100}
                next={selectedOffer.apr * 100}
                suffix="%"
                decimals={2}
              />
              <CompRow label="Withholding Rate" old={existingLoan.swipeBps / 100} next={selectedOffer.swipeBps / 100} suffix="%" decimals={2} />
              <CompRow label="Expected Term" old={Math.round(existingLoan.expectedTermDays / 30)} next={Math.round(selectedOffer.expectedTermDays / 30)} suffix=" months" />
              <CompRow label="Max Term" old={Math.round(existingLoan.maxTermDays / 30)} next={Math.round(selectedOffer.maxTermDays / 30)} suffix=" months" />
              <CompRow label="Min Payment" old={existingLoan.minPeriodAmount} next={selectedOffer.minPeriodAmount} money />
            </tbody>
          </table>
        </div>
      )}

      <div className="section">
        <h3>Disbursement Bank Account</h3>
        <p className="section-desc">
          Select the bank account where the remaining funds will be deposited via RTP/FedNow after payoff.
        </p>
        <div className="bank-accounts-list">
          {merchantBankAccounts.map(account => (
            <button
              key={account.id}
              className={`bank-account-select ${selectedBankAccount?.id === account.id ? 'selected' : ''}`}
              onClick={() => selectBankAccount(account)}
            >
              <AccountCard account={account} type="bank" />
            </button>
          ))}
        </div>
      </div>

      <ApiCallPanel calls={apiCalls} step={2} />
    </div>
  );
}

function CompRow({ label, old, next, money = false, suffix = '', decimals }) {
  const format = (v) => {
    if (money) return formatMoney(v);
    if (decimals != null) return `${Number(v).toFixed(decimals)}${suffix}`;
    return `${v}${suffix}`;
  };
  const diff = next - old;
  const diffStr = money ? formatMoney(Math.abs(diff)) : `${Math.abs(diff).toFixed(decimals ?? 0)}${suffix}`;
  const direction = Math.abs(diff) < 0.0001 ? 'same' : diff > 0 ? 'up' : 'down';

  return (
    <tr>
      <td>{label}</td>
      <td>{format(old)}</td>
      <td className="bold">{format(next)}</td>
      <td className={`change ${direction}`}>
        {direction === 'up' && `+${diffStr}`}
        {direction === 'down' && `-${diffStr}`}
        {direction === 'same' && 'No change'}
      </td>
    </tr>
  );
}
