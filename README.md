# Jaris Refinance Prototype

Interactive 5-step wizard demonstrating Jaris's loan refinance product flow — from reviewing an existing merchant cash advance through offer selection, terms acceptance, payoff execution, and fund disbursement.

## Demo Flow

| Step | Title | What Happens |
|------|-------|-------------|
| 1 | **Review Existing Loan** | Loads the merchant's current loan from the Jaris Loan Service — balance, terms, transaction history, FinXact ledger account |
| 2 | **Refinance Offers** | Fetches two refinance offers via the Backend Orchestration service, compares terms side-by-side, and selects a disbursement bank account |
| 3 | **Accept Terms & Execute** | Borrower reviews the new loan agreement (principal, fee, factor rate, APR, withholding rate, term), accepts terms via checkbox, then executes — creating the refinance child loan and paying off the existing obligation |
| 4 | **Fund Remaining Balance** | Disburses surplus funds to the merchant's bank account via RTP/FedNow; handles Plaid re-authentication for stale bank connections (>12 months) |
| 5 | **Summary** | Final state overview with before/after comparison, full ledger trail, and a borrower experience section showing next payment date, estimated daily withholding, 30-day minimum progress, and projected payoff timeline |

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. Click **Load Data** on Step 1 to begin the walkthrough.

## Tech Stack

- **React 19** + **Vite 7** — JavaScript (no TypeScript)
- **State management** — Context API + `useReducer` with memoized callbacks
- **Styling** — Single `App.css`, no CSS frameworks
- **API layer** — Service factory pattern with mock/real API toggle (see `src/services/`)

## Project Structure

```
src/
  App.jsx                  # Main app shell with wizard layout
  App.css                  # All application styles
  context/
    RefinanceContext.jsx    # Central state: reducer, actions, API orchestration
  components/
    WizardStepper.jsx      # Step progress indicator
    WizardControls.jsx     # Back / Execute / Next navigation bar
    Header.jsx             # App header
    ApiCallPanel.jsx       # Expandable API call log per step
    LedgerVisualization.jsx # FinXact double-entry ledger display
    PlaidRelinkModal.jsx   # Plaid re-authentication modal for stale accounts
    steps/
      Step1ExistingLoan.jsx
      Step2RefinanceOffer.jsx
      Step3CreateAndPayoff.jsx
      Step4FundRemaining.jsx
      Step5Summary.jsx
    shared/
      LoanCard.jsx         # Reusable loan detail card
      AccountCard.jsx      # Bank account / FinXact account card
      StateTimeline.jsx    # Loan state lifecycle visualization
      TransactionRow.jsx   # Transaction line item
      format.js            # Money/date formatting utilities
  data/
    mockData.js            # Mock loan, offers, accounts, transactions
  services/
    index.js               # Service factory (mock vs. real)
    mockService.js         # Simulated API responses with delays
    apiService.js          # Real Jaris API integration (when configured)
```

## Loan Model

This demo models a **daily amortizing merchant cash advance** with a fixed fee component:

- **Factor rate** pricing (e.g., 1.15 = 15% fee on principal)
- **Daily withholding** from card processing volume at a configurable percentage
- **30-day minimum payment** assessment periods
- **18-month maximum** payback term, ~8-9 month average
- Fee and principal repaid proportionally with each payment

## Jaris APIs Demonstrated

The demo references endpoints across multiple Jaris services:

- **Loan Service** — Loan lifecycle, modifications, balance periods, discount calculations
- **FinXact** — Ledger account creation, double-entry bookkeeping
- **Backend Orchestration** — Refinance offer generation, payoff execution
- **BAM** — Bank account management, Plaid integration
- **Payments** — RTP/FedNow disbursement

## Environment Variables

Copy `.env.example` to `.env` and configure if using real API mode:

```
VITE_API_BASE_URL=https://api.jaris.io
VITE_USE_MOCK=true
```

The demo runs fully in mock mode by default — no API credentials needed.
