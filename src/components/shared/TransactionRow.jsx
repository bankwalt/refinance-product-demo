import { TRANSACTION_TYPES, TRANSACTION_METHODS } from '../../data/loanStates';
import { formatMoney, formatDate } from './format';

export default function TransactionRow({ tx }) {
  const typeInfo = TRANSACTION_TYPES[tx.type] || { label: tx.type, color: '#64748b' };

  return (
    <tr className="transaction-row">
      <td>{formatDate(tx.date || tx.createdAt)}</td>
      <td>
        <span className="tx-type-badge" style={{ backgroundColor: typeInfo.color }}>
          {typeInfo.label}
        </span>
      </td>
      <td>
        <span className="tx-method">{TRANSACTION_METHODS[tx.method] || tx.method}</span>
      </td>
      <td className="amount">{formatMoney(tx.amount)}</td>
      <td className="amount">{formatMoney(tx.principal)}</td>
      <td className="amount">{formatMoney(tx.interest)}</td>
      <td>
        <span className={`tx-status ${tx.status?.toLowerCase()}`}>{tx.status}</span>
      </td>
    </tr>
  );
}
