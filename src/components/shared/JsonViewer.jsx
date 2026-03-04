import { useState } from 'react';

export default function JsonViewer({ data, label, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!data) return null;

  const jsonStr = JSON.stringify(data, null, 2);

  return (
    <div className="json-viewer">
      <button className="json-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="json-chevron">{expanded ? '\u25BC' : '\u25B6'}</span>
        {label || 'JSON'}
        <span className="json-size">{jsonStr.length} chars</span>
      </button>
      {expanded && (
        <pre className="json-content">
          <code>{jsonStr}</code>
        </pre>
      )}
    </div>
  );
}
