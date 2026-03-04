import { createContext, useContext, useReducer, useCallback } from 'react';
import { getServices } from '../services/serviceFactory';
import { resetMockState } from '../services/mockProvider';
import { MOCK_IDS, MOCK_EXISTING_LOAN } from '../data/mockData';

const RefinanceContext = createContext(null);

const TOTAL_STEPS = 5;

const initialState = {
  currentStep: 1,
  completedSteps: [],
  isExecuting: false,

  apiMode: 'mock',

  existingLoan: null,
  existingLoanAccount: null,
  existingLoanTransactions: [],

  offers: [],
  selectedOffer: null,
  merchantBankAccounts: [],
  selectedBankAccount: null,

  newLoan: null,
  newLoanAccount: null,

  payoffTransaction: null,
  existingLoanAfterPayoff: null,

  fundingTransaction: null,
  paymentOrder: null,
  newLoanAfterFunding: null,

  ledgerEntries: [],
  apiCalls: [],
  error: null,

  // Terms acceptance
  termsAccepted: false,

  // Plaid re-auth state
  plaidRelinkState: null, // null | 'stale_detected' | 'relinking' | 'relinked'
};

function refinanceReducer(state, action) {
  switch (action.type) {
    case 'SET_API_MODE':
      return { ...state, apiMode: action.payload };

    case 'SET_STEP':
      return { ...state, currentStep: action.payload, error: null };

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
      };

    case 'SET_EXECUTING':
      return { ...state, isExecuting: action.payload };

    case 'LOAD_EXISTING_LOAN':
      return {
        ...state,
        existingLoan: action.payload.loan,
        existingLoanAccount: action.payload.account,
        existingLoanTransactions: action.payload.transactions,
      };

    case 'LOAD_OFFERS':
      return {
        ...state,
        offers: action.payload.offers,
        merchantBankAccounts: action.payload.bankAccounts,
      };

    case 'SELECT_OFFER':
      return { ...state, selectedOffer: action.payload };

    case 'SELECT_BANK_ACCOUNT':
      return { ...state, selectedBankAccount: action.payload, plaidRelinkState: null };

    case 'CREATE_NEW_LOAN':
      return {
        ...state,
        newLoan: action.payload.loan,
        newLoanAccount: action.payload.account,
        existingLoan: action.payload.updatedExistingLoan || state.existingLoan,
      };

    case 'RECORD_PAYOFF':
      return {
        ...state,
        payoffTransaction: action.payload.transaction,
        existingLoanAfterPayoff: action.payload.updatedLoan,
        existingLoan: action.payload.updatedLoan,
        existingLoanAccount: action.payload.updatedAccount || state.existingLoanAccount,
      };

    case 'RECORD_FUNDING':
      return {
        ...state,
        fundingTransaction: action.payload.transaction,
        paymentOrder: action.payload.paymentOrder,
        newLoanAfterFunding: action.payload.updatedLoan,
        newLoan: action.payload.updatedLoan,
        newLoanAccount: action.payload.updatedAccount || state.newLoanAccount,
      };

    case 'ADD_LEDGER_ENTRIES':
      return { ...state, ledgerEntries: [...state.ledgerEntries, ...action.payload] };

    case 'ADD_API_CALL':
      return { ...state, apiCalls: [...state.apiCalls, { ...action.payload, timestamp: Date.now() }] };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isExecuting: false };

    case 'ACCEPT_TERMS':
      return { ...state, termsAccepted: true };

    case 'SET_PLAID_RELINK_STATE':
      return { ...state, plaidRelinkState: action.payload };

    case 'BANK_ACCOUNT_REVERIFIED':
      return {
        ...state,
        plaidRelinkState: 'relinked',
        merchantBankAccounts: state.merchantBankAccounts.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
        selectedBankAccount: state.selectedBankAccount?.id === action.payload.id
          ? action.payload
          : state.selectedBankAccount,
      };

    case 'RESET':
      return { ...initialState, apiMode: state.apiMode };

    default:
      return state;
  }
}

export function RefinanceProvider({ children }) {
  const [state, dispatch] = useReducer(refinanceReducer, initialState);

  const logApiCall = useCallback((step, result) => {
    dispatch({
      type: 'ADD_API_CALL',
      payload: {
        step,
        method: result.method,
        url: result.path,
        requestBody: result.requestBody,
        responseBody: result.data,
        statusCode: result.status,
        duration: result.duration,
      },
    });
  }, []);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      dispatch({ type: 'SET_STEP', payload: step });
    }
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: Math.min(state.currentStep + 1, TOTAL_STEPS) });
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    dispatch({ type: 'SET_STEP', payload: Math.max(state.currentStep - 1, 1) });
  }, [state.currentStep]);

  const setApiMode = useCallback((mode) => {
    dispatch({ type: 'SET_API_MODE', payload: mode });
  }, []);

  const selectOffer = useCallback((offer) => {
    dispatch({ type: 'SELECT_OFFER', payload: offer });
  }, []);

  const selectBankAccount = useCallback((account) => {
    dispatch({ type: 'SELECT_BANK_ACCOUNT', payload: account });
  }, []);

  const acceptTerms = useCallback(() => {
    dispatch({ type: 'ACCEPT_TERMS' });
  }, []);

  const reset = useCallback(() => {
    resetMockState();
    dispatch({ type: 'RESET' });
  }, []);

  // Step 1: Load existing loan data
  const executeStep1 = useCallback(async () => {
    dispatch({ type: 'SET_EXECUTING', payload: true });
    try {
      const services = getServices(state.apiMode);

      const loanResult = await services.loan.getLoan(MOCK_IDS.existingLoanId);
      logApiCall(1, loanResult);

      const accountResult = await services.finxact.getLoanAccount(
        loanResult.data.loanAccountId || MOCK_IDS.existingLoanAccountId
      );
      logApiCall(1, accountResult);

      const txResult = await services.loan.getLoanTransactions(MOCK_IDS.existingLoanId);
      logApiCall(1, txResult);

      dispatch({
        type: 'LOAD_EXISTING_LOAN',
        payload: {
          loan: loanResult.data,
          account: accountResult.data,
          transactions: txResult.data,
        },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_EXECUTING', payload: false });
    }
  }, [state.apiMode, logApiCall]);

  // Step 2: Load offers and bank accounts
  const executeStep2 = useCallback(async () => {
    dispatch({ type: 'SET_EXECUTING', payload: true });
    try {
      const services = getServices(state.apiMode);

      const offersResult = await services.orchestration.getOffers(MOCK_IDS.shopId);
      logApiCall(2, offersResult);

      const accountsResult = await services.bam.getShopAccounts(MOCK_IDS.shopId);
      logApiCall(2, accountsResult);

      dispatch({
        type: 'LOAD_OFFERS',
        payload: {
          offers: offersResult.data,
          bankAccounts: accountsResult.data,
        },
      });
      dispatch({ type: 'COMPLETE_STEP', payload: 2 });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_EXECUTING', payload: false });
    }
  }, [state.apiMode, logApiCall]);

  // Step 3: Create refinance loan + payoff existing loan (combined)
  const executeStep3 = useCallback(async () => {
    if (!state.selectedOffer) {
      dispatch({ type: 'SET_ERROR', payload: 'Please select an offer first.' });
      return;
    }
    dispatch({ type: 'SET_EXECUTING', payload: true });
    try {
      const services = getServices(state.apiMode);
      const offer = state.selectedOffer;

      // === PART 1: Create Refinance Loan ===

      // 1. Modify existing loan to create refinance child loan
      const modifyResult = await services.loan.modifyLoan(MOCK_IDS.existingLoanId, {
        termsId: offer.id,
        periodTermDays: offer.periodTermDays,
        minPeriodAmount: offer.minPeriodAmount,
        swipeBps: offer.swipeBps,
        maxTermDays: offer.maxTermDays,
        expectedTermDays: offer.expectedTermDays,
        signedAt: new Date().toISOString(),
        offerId: offer.id,
      });
      logApiCall(3, modifyResult);

      const newLoanId = modifyResult.data.id;

      // 2. Create FinXact loan account for new loan
      const accountResult = await services.finxact.createLoanAccount({
        shopId: MOCK_IDS.shopId,
        partnerId: MOCK_IDS.partnerId,
        accountType: 'FLEX_LOAN',
        name: 'Sunrise Coffee Shop - Refinance Loan',
        loanId: newLoanId,
        offerId: offer.id,
      });
      logApiCall(3, accountResult);

      // 3. Approve the new loan
      const approveResult = await services.loan.approveLoan(newLoanId);
      logApiCall(3, approveResult);

      // Get updated existing loan (now has modificationChildId)
      const existingLoanResult = await services.loan.getLoan(MOCK_IDS.existingLoanId);
      logApiCall(3, existingLoanResult);

      dispatch({
        type: 'CREATE_NEW_LOAN',
        payload: {
          loan: approveResult.data,
          account: accountResult.data,
          updatedExistingLoan: existingLoanResult.data,
        },
      });

      // Add ledger entries for loan creation (proper double-entry)
      const today = new Date().toISOString().split('T')[0];
      dispatch({
        type: 'ADD_LEDGER_ENTRIES',
        payload: [
          {
            id: 'le-001',
            step: 3,
            date: today,
            description: 'New loan funded - Principal booked',
            account: 'FIB Loan Funding Account',
            debit: offer.principal,
            credit: 0,
          },
          {
            id: 'le-002',
            step: 3,
            date: today,
            description: 'New loan funded - Loan account credited',
            account: 'New Loan Account',
            debit: 0,
            credit: offer.principal,
          },
        ],
      });

      // === PART 2: Payoff Existing Loan ===

      const payoffAmount = existingLoanResult.data.balance;

      // 4. Calculate discount
      const discountResult = await services.loan.calculateDiscount(MOCK_IDS.existingLoanId);
      logApiCall(3, discountResult);

      // 5. Create prepayment on old loan
      const prepayResult = await services.loan.createPrepayPayment({
        loanId: MOCK_IDS.existingLoanId,
        accountId: state.selectedBankAccount?.id || MOCK_IDS.bankAccountId,
        amount: payoffAmount,
        idempotencyId: `idem-payoff-${Date.now()}`,
      });
      logApiCall(3, prepayResult);

      // 6. Re-fetch existing loan to get updated state (PAID_CLOSED)
      const updatedLoanResult = await services.loan.getLoan(MOCK_IDS.existingLoanId);
      logApiCall(3, updatedLoanResult);

      // 7. Re-fetch existing loan FinXact account
      const updatedAccountResult = await services.finxact.getLoanAccount(MOCK_IDS.existingLoanAccountId);
      logApiCall(3, updatedAccountResult);

      dispatch({
        type: 'RECORD_PAYOFF',
        payload: {
          transaction: prepayResult.data,
          updatedLoan: updatedLoanResult.data,
          updatedAccount: updatedAccountResult.data,
        },
      });

      // Add payoff ledger entries (proper double-entry)
      dispatch({
        type: 'ADD_LEDGER_ENTRIES',
        payload: [
          {
            id: 'le-003',
            step: 3,
            date: today,
            description: 'Payoff - Debit new loan for payoff amount',
            account: 'New Loan Account',
            debit: payoffAmount,
            credit: 0,
          },
          {
            id: 'le-004',
            step: 3,
            date: today,
            description: 'Payoff - Old loan obligation cleared',
            account: 'Collections Account',
            debit: 0,
            credit: payoffAmount,
          },
        ],
      });

      dispatch({ type: 'COMPLETE_STEP', payload: 3 });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_EXECUTING', payload: false });
    }
  }, [state.apiMode, state.selectedOffer, state.selectedBankAccount, logApiCall]);

  // Step 4: Fund remaining to borrower via RTP/FedNow
  const executeStep4 = useCallback(async () => {
    dispatch({ type: 'SET_EXECUTING', payload: true });
    try {
      const services = getServices(state.apiMode);
      const disbursementAmount = state.selectedOffer.principal - MOCK_EXISTING_LOAN.balance;
      const bankAccountId = state.selectedBankAccount?.id || MOCK_IDS.bankAccountId;

      // 1. Create funding payment via FinXact
      const fundingResult = await services.finxact.createFundingPayment({
        idempotencyId: `idem-fund-refi-${Date.now()}`,
        loanAccountId: MOCK_IDS.newLoanAccountId,
        receivingExternalAccountId: state.selectedBankAccount?.id === MOCK_IDS.staleBankAccountId
          ? MOCK_IDS.staleBankAccountExternalId
          : MOCK_IDS.bankAccountExternalId,
        method: 'RTP',
        principalAmount: disbursementAmount,
        interestAmount: 0,
        companyName: 'Jaris',
        companyEntryDescription: 'REFI DISB',
      });
      logApiCall(4, fundingResult);

      // 2. Create RTP payment order
      const paymentOrderResult = await services.finxact.createPaymentOrder({
        idempotencyId: `idem-po-refi-${Date.now()}`,
        originatingAccountId: MOCK_IDS.newLoanAccountId,
        network: 'RTP',
        direction: 'CREDIT',
        amount: disbursementAmount,
        receivingExternalAccountId: state.selectedBankAccount?.id === MOCK_IDS.staleBankAccountId
          ? MOCK_IDS.staleBankAccountExternalId
          : MOCK_IDS.bankAccountExternalId,
        companyName: 'Jaris',
        companyEntryDescription: 'REFI DISB',
      });
      logApiCall(4, paymentOrderResult);

      // 3. Create the loan-level funding payment
      const loanFundResult = await services.loan.createFundingPayment({
        loanId: MOCK_IDS.newLoanId,
        accountId: bankAccountId,
        method: 'RTP',
        idempotencyId: `idem-loan-fund-${Date.now()}`,
      });
      logApiCall(4, loanFundResult);

      // 4. Re-fetch new loan
      const updatedNewLoan = await services.loan.getLoan(MOCK_IDS.newLoanId);
      logApiCall(4, updatedNewLoan);

      // 5. Re-fetch new loan FinXact account
      const updatedNewAccount = await services.finxact.getLoanAccount(MOCK_IDS.newLoanAccountId);
      logApiCall(4, updatedNewAccount);

      dispatch({
        type: 'RECORD_FUNDING',
        payload: {
          transaction: loanFundResult.data,
          paymentOrder: paymentOrderResult.data,
          updatedLoan: updatedNewLoan.data,
          updatedAccount: updatedNewAccount.data,
        },
      });

      // Add disbursement ledger entries
      const lastFour = state.selectedBankAccount?.lastFour || '8437';
      dispatch({
        type: 'ADD_LEDGER_ENTRIES',
        payload: [
          {
            id: 'le-005',
            step: 4,
            date: new Date().toISOString().split('T')[0],
            description: `RTP disbursement to merchant (*${lastFour})`,
            account: 'New Loan Account',
            debit: disbursementAmount,
            credit: 0,
          },
          {
            id: 'le-006',
            step: 4,
            date: new Date().toISOString().split('T')[0],
            description: `RTP credit to bank account (*${lastFour})`,
            account: `External Bank Account (*${lastFour})`,
            debit: 0,
            credit: disbursementAmount,
          },
        ],
      });

      dispatch({ type: 'COMPLETE_STEP', payload: 4 });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_EXECUTING', payload: false });
    }
  }, [state.apiMode, state.selectedOffer, state.selectedBankAccount, logApiCall]);

  // Plaid re-authentication
  const relinkBankAccount = useCallback(async (accountId) => {
    dispatch({ type: 'SET_PLAID_RELINK_STATE', payload: 'relinking' });
    try {
      const services = getServices(state.apiMode);
      const result = await services.bam.verifyBankAccountViaPlaid(accountId);
      logApiCall(4, result);
      dispatch({ type: 'BANK_ACCOUNT_REVERIFIED', payload: result.data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Plaid re-authentication failed: ' + err.message });
      dispatch({ type: 'SET_PLAID_RELINK_STATE', payload: 'stale_detected' });
    }
  }, [state.apiMode, logApiCall]);

  const value = {
    ...state,
    totalSteps: TOTAL_STEPS,
    goToStep,
    nextStep,
    prevStep,
    setApiMode,
    selectOffer,
    selectBankAccount,
    acceptTerms,
    reset,
    executeStep1,
    executeStep2,
    executeStep3,
    executeStep4,
    relinkBankAccount,
    logApiCall,
  };

  return (
    <RefinanceContext.Provider value={value}>
      {children}
    </RefinanceContext.Provider>
  );
}

export function useRefinance() {
  const context = useContext(RefinanceContext);
  if (!context) {
    throw new Error('useRefinance must be used within a RefinanceProvider');
  }
  return context;
}
