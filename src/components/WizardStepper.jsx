import { useRefinance } from '../context/RefinanceContext';

const STEP_LABELS = [
  'Review Existing Loan',
  'Refinance Offer',
  'Create & Payoff',
  'Fund Remaining',
  'Summary',
];

export default function WizardStepper() {
  const { currentStep, completedSteps, goToStep } = useRefinance();

  return (
    <nav className="wizard-stepper">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = completedSteps.includes(stepNum);
        const isCurrent = currentStep === stepNum;
        const isClickable = isCompleted || stepNum <= Math.max(...completedSteps, 0) + 1;

        return (
          <div key={stepNum} className="wizard-step-wrapper">
            <button
              className={`wizard-step ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isClickable && goToStep(stepNum)}
              disabled={!isClickable}
            >
              <span className="step-circle">
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  stepNum
                )}
              </span>
              <span className="step-label">{label}</span>
            </button>
            {stepNum < STEP_LABELS.length && <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />}
          </div>
        );
      })}
    </nav>
  );
}
