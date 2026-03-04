import { useState } from 'react';

const METHOD_COLORS = {
  GET: '#22c55e',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
};

export default function ApiCallPanel({ calls, step }) {
  const filtered = step != null ? calls.filter(c => c.step === step) : calls;

  if (filtered.length === 0) return null;

  return (
    <div className="api-call-panel">
      <h4 className="api-panel-title">API Calls</h4>
      {filtered.map((call, i) => (
        <ApiCallItem key={`${call.url}-${i}`} call={call} />
      ))}
    </div>
  );
}

function ApiCallItem({ call }) {
  const [expanded, setExpanded] = useState(false);
  const methodColor = METHOD_COLORS[call.method] || '#64748b';

  return (
    <div className="api-call-item">
      <button className="api-call-header" onClick={() => setExpanded(!expanded)}>
        <span className="api-call-chevron">{expanded ? '\u25BC' : '\u25B6'}</span>
        <span className="api-method" style={{ color: methodColor }}>{call.method}</span>
        <span className="api-url">{call.url}</span>
        <span className={`api-status ${call.statusCode < 400 ? 'success' : 'error'}`}>
          {call.statusCode}
        </span>
        <span className="api-duration">{call.duration}ms</span>
      </button>
      {expanded && (
        <div className="api-call-body">
          {call.requestBody && (
            <div className="api-section">
              <div className="api-section-label">Request Body</div>
              <pre className="api-json"><code>{JSON.stringify(call.requestBody, null, 2)}</code></pre>
            </div>
          )}
          <div className="api-section">
            <div className="api-section-label">Response Body</div>
            <pre className="api-json"><code>{JSON.stringify(call.responseBody, null, 2)}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
}
