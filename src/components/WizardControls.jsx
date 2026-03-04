import { useRefinance } from '../context/RefinanceContext';
import { isBankAccountStale } from '../data/mockData';

export default function WizardControls() {
  const {
    currentStep,
    totalSteps,
    completedSteps,
    isExecuting,
    selectedOffer,
    selectedBankAccount,
    termsAccepted,
    plaidRelinkState,
    prevStep,
    nextStep,
    reset,
    executeStep1,
    executeStep2,
    executeStep3,
    executeStep4,
  } = useRefinance();

  const isStepCompleted = completedSteps.includes(currentStep);

  const executeHandlers = {
    1: executeStep1,
    2: executeStep2,
    3: executeStep3,
    4: executeStep4,
  };

  const getActionLabel = () => {
    if (isStepCompleted && currentStep < totalSteps) return 'Next Step';
    if (currentStep === 5) return 'Restart Demo';
    if (currentStep <= 2) return 'Load Data';
    if (currentStep === 3) {
      if (!selectedOffer) return 'Select an Offer First';
      if (!termsAccepted) return 'Review Terms Above';
      return 'Execute Refinance';
    }
    if (currentStep === 4) return 'Execute: Fund Remaining';
    return 'Execute Step';
  };

  const handleAction = () => {
    if (currentStep === 5) {
      reset();
      return;
    }
    if (isStepCompleted) {
      nextStep();
      return;
    }
    const handler = executeHandlers[currentStep];
    if (handler) handler();
  };

  const isActionDisabled = () => {
    if (isExecuting) return true;
    if (currentStep === 3 && !isStepCompleted && (!selectedOffer || !termsAccepted)) return true;
    if (currentStep === 4 && !isStepCompleted &&
        selectedBankAccount && isBankAccountStale(selectedBankAccount) &&
        plaidRelinkState !== 'relinked') return true;
    return false;
  };

  return (
    <div className="wizard-controls">
      <button
        className="btn btn-secondary"
        onClick={prevStep}
        disabled={currentStep === 1 || isExecuting}
      >
        Back
      </button>
      <div className="step-indicator">
        Step {currentStep} of {totalSteps}
      </div>
      <button
        className={`btn ${isStepCompleted ? 'btn-primary' : 'btn-action'}`}
        onClick={handleAction}
        disabled={isActionDisabled()}
      >
        {isExecuting && <span className="spinner" />}
        {getActionLabel()}
      </button>
    </div>
  );
}
