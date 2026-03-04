import { LOAN_STATES, LOAN_STATE_COLORS, LOAN_STATE_LABELS, getStateIndex } from '../../data/loanStates';

const DISPLAY_STATES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'PENDING_FUNDING',
  'NORMAL',
  'PAID',
  'PAID_CLOSED',
];

export default function StateTimeline({ currentState, label }) {
  const currentIdx = DISPLAY_STATES.indexOf(currentState);

  return (
    <div className="state-timeline">
      {label && <div className="timeline-label">{label}</div>}
      <div className="timeline-track">
        {DISPLAY_STATES.map((state, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = state === currentState;
          const color = LOAN_STATE_COLORS[state] || '#64748b';

          return (
            <div key={state} className="timeline-node-wrapper">
              <div
                className={`timeline-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                style={{
                  borderColor: isCurrent || isCompleted ? color : '#cbd5e1',
                  backgroundColor: isCompleted ? color : isCurrent ? color : 'transparent',
                }}
              >
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <span className={`timeline-state-label ${isCurrent ? 'current' : ''}`}>
                {LOAN_STATE_LABELS[state] || state}
              </span>
              {i < DISPLAY_STATES.length - 1 && (
                <div
                  className={`timeline-connector ${isCompleted ? 'completed' : ''}`}
                  style={{ backgroundColor: isCompleted ? color : '#cbd5e1' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
