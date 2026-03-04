import { RefinanceProvider, useRefinance } from './context/RefinanceContext';
import Header from './components/Header';
import WizardStepper from './components/WizardStepper';
import WizardControls from './components/WizardControls';
import Step1ExistingLoan from './components/steps/Step1ExistingLoan';
import Step2RefinanceOffer from './components/steps/Step2RefinanceOffer';
import Step3CreateAndPayoff from './components/steps/Step3CreateAndPayoff';
import Step4FundRemaining from './components/steps/Step4FundRemaining';
import Step5Summary from './components/steps/Step5Summary';
import './App.css';

const STEPS = {
  1: Step1ExistingLoan,
  2: Step2RefinanceOffer,
  3: Step3CreateAndPayoff,
  4: Step4FundRemaining,
  5: Step5Summary,
};

function WizardContent() {
  const { currentStep, error } = useRefinance();
  const StepComponent = STEPS[currentStep];

  return (
    <div className="app-layout">
      <Header />
      <WizardStepper />
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span className="error-icon">!</span>
            <span>{error}</span>
          </div>
        )}
        {StepComponent && <StepComponent />}
      </main>
      <WizardControls />
    </div>
  );
}

export default function App() {
  return (
    <RefinanceProvider>
      <WizardContent />
    </RefinanceProvider>
  );
}
