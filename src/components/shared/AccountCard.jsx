import { formatMoney } from './format';
import { isBankAccountStale } from '../../data/mockData';

export default function AccountCard({ account, type = 'bank' }) {
  if (!account) return null;

  if (type === 'bank') {
    const isStale = isBankAccountStale(account);

    return (
      <div className="account-card">
        <div className="account-card-header">
          <span className="account-icon">BK</span>
          <div>
            <div className="account-name">{account.bankName || 'Bank Account'}</div>
            <div className="account-detail">
              {account.accountIdentifierType} *{account.lastFour}
            </div>
            {account.lastVerifiedAt && (
              <div className="account-detail">
                Verified: {new Date(account.lastVerifiedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}
              </div>
            )}
          </div>
          <div className="account-status-group">
            <span className={`account-status ${account.status?.toLowerCase()}`}>{account.status}</span>
            {isStale && <span className="account-status stale">STALE</span>}
          </div>
        </div>
        <div className="account-features">
          {account.achPushEnabled && <span className="feature-tag">ACH Push</span>}
          {account.achPullEnabled && <span className="feature-tag">ACH Pull</span>}
          {account.rtpPushEnabled && <span className="feature-tag rtp">RTP</span>}
          {account.isPrimary && <span className="feature-tag primary">Primary</span>}
        </div>
      </div>
    );
  }

  // FinXact loan account
  return (
    <div className="account-card finxact">
      <div className="account-card-header">
        <span className="account-icon fx">FX</span>
        <div>
          <div className="account-name">{account.name || 'FinXact Loan Account'}</div>
          <div className="account-detail">{account.type} - {account.status}</div>
        </div>
      </div>
      <div className="account-balances">
        <div className="balance-row">
          <span>Posted Balance</span>
          <span className="balance-value">{formatMoney(Math.abs(account.balance || 0))}</span>
        </div>
        <div className="balance-row">
          <span>Principal</span>
          <span className="balance-value">{formatMoney(Math.abs(account.postedPrincipalBalance || 0))}</span>
        </div>
        <div className="balance-row">
          <span>Fee</span>
          <span className="balance-value">{formatMoney(Math.abs(account.postedInterestBalance || 0))}</span>
        </div>
      </div>
    </div>
  );
}
