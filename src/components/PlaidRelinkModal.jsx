import { useRefinance } from '../context/RefinanceContext';

export default function PlaidRelinkModal({ account, onClose }) {
  const { plaidRelinkState, relinkBankAccount } = useRefinance();

  const isRelinking = plaidRelinkState === 'relinking';
  const isRelinked = plaidRelinkState === 'relinked';

  const handleRelink = () => {
    relinkBankAccount(account.id);
  };

  return (
    <div className="plaid-modal-overlay" onClick={!isRelinking ? onClose : undefined}>
      <div className="plaid-modal" onClick={e => e.stopPropagation()}>
        <div className="plaid-modal-header">
          <div className="plaid-logo">
            <span className="plaid-logo-icon">&#9678;</span>
            PLAID
          </div>
          <button className="plaid-close" onClick={onClose} disabled={isRelinking}>
            &times;
          </button>
        </div>

        {!isRelinked ? (
          <>
            <div className="plaid-modal-body">
              <h3>Re-authenticate Your Account</h3>
              <div className="plaid-account-info">
                <span className="plaid-bank-icon">BK</span>
                <div>
                  <span className="plaid-bank-name">{account.bankName}</span>
                  <span className="plaid-account-last4">****{account.lastFour}</span>
                </div>
              </div>
              <p className="plaid-description">
                Your bank connection has expired (last verified more than 12 months ago).
                Please re-authenticate to continue with the disbursement.
              </p>
              <div className="plaid-stale-info">
                <span className="stale-label">Last Verified</span>
                <span className="stale-date">
                  {new Date(account.lastVerifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="plaid-modal-footer">
              <button
                className="btn btn-action plaid-connect-btn"
                onClick={handleRelink}
                disabled={isRelinking}
              >
                {isRelinking && <span className="spinner" />}
                {isRelinking ? 'Connecting to Bank...' : 'Connect Account'}
              </button>
            </div>
          </>
        ) : (
          <div className="plaid-modal-body plaid-success">
            <div className="plaid-success-icon">
              <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Account Verified</h3>
            <p className="plaid-description">
              {account.bankName} ****{account.lastFour} has been re-authenticated successfully.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
