import { useRefinance } from '../context/RefinanceContext';

export default function Header() {
  const { apiMode, setApiMode, reset } = useRefinance();

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Refinance Product Demo</h1>
        <span className="header-subtitle">Loan Service + FinXact Ledger</span>
      </div>
      <div className="header-right">
        <div className="api-toggle">
          <span className={`toggle-label ${apiMode === 'mock' ? 'active' : ''}`}>Mock</span>
          <button
            className={`toggle-switch ${apiMode === 'real' ? 'on' : ''}`}
            onClick={() => setApiMode(apiMode === 'mock' ? 'real' : 'mock')}
            aria-label="Toggle API mode"
          >
            <span className="toggle-thumb" />
          </button>
          <span className={`toggle-label ${apiMode === 'real' ? 'active' : ''}`}>Real API</span>
        </div>
        <button className="btn btn-ghost" onClick={reset}>
          Reset Demo
        </button>
      </div>
    </header>
  );
}
