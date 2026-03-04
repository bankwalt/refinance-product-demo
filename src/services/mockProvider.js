import {
  MOCK_IDS,
  MOCK_EXISTING_LOAN,
  MOCK_EXISTING_LOAN_ACCOUNT,
  MOCK_EXISTING_LOAN_TRANSACTIONS,
  MOCK_OFFERS,
  MOCK_MERCHANT_BANK_ACCOUNTS,
  MOCK_DISCOUNT_CALCULATION,
  createMockNewLoan,
  createMockNewLoanAccount,
} from '../data/mockData';

function delay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 300));
}

function response(data, method, path, requestBody = null, status = 200) {
  return { data, status, duration: Math.round(300 + Math.random() * 400), method, path, requestBody, ok: true };
}

let mockState = null;

function ensureState() {
  if (!mockState) resetMockState();
}

export function resetMockState() {
  mockState = {
    existingLoan: JSON.parse(JSON.stringify(MOCK_EXISTING_LOAN)),
    existingLoanAccount: JSON.parse(JSON.stringify(MOCK_EXISTING_LOAN_ACCOUNT)),
    existingLoanTransactions: JSON.parse(JSON.stringify(MOCK_EXISTING_LOAN_TRANSACTIONS)),
    newLoan: null,
    newLoanAccount: null,
    newLoanTransactions: [],
    payoffTransaction: null,
    fundingTransaction: null,
    paymentOrder: null,
    bankAccountOverrides: {},
  };
}

export const mockLoanService = {
  async getLoan(loanId) {
    ensureState();
    await delay();
    const path = `/loan/v1/loans/${loanId}`;
    if (loanId === MOCK_IDS.existingLoanId) {
      return response(mockState.existingLoan, 'GET', path);
    }
    if (loanId === MOCK_IDS.newLoanId && mockState.newLoan) {
      return response(mockState.newLoan, 'GET', path);
    }
    return { data: { error: 'Loan not found' }, status: 404, duration: 300, method: 'GET', path, ok: false };
  },

  async modifyLoan(loanId, dto) {
    ensureState();
    await delay(600);
    const path = `/loan/v1/loans/${loanId}/modify`;
    const selectedOffer = MOCK_OFFERS.find(o => o.id === dto.offerId) || MOCK_OFFERS[0];
    const newLoan = createMockNewLoan(selectedOffer);
    newLoan.state = 'PENDING_APPROVAL';
    mockState.newLoan = newLoan;
    mockState.existingLoan.modificationChildId = MOCK_IDS.newLoanId;
    return response(newLoan, 'POST', path, dto, 201);
  },

  async approveLoan(loanId) {
    ensureState();
    await delay(500);
    const path = `/loan/v1/loans/${loanId}/approve`;
    if (loanId === MOCK_IDS.newLoanId && mockState.newLoan) {
      mockState.newLoan.state = 'APPROVED';
      mockState.newLoan.approvedAt = new Date().toISOString();
      return response(mockState.newLoan, 'POST', path);
    }
    return { data: { error: 'Loan not found' }, status: 404, duration: 300, method: 'POST', path, ok: false };
  },

  async getLoanTransactions(loanId) {
    ensureState();
    await delay(300);
    const path = `/loan/v1/loans/${loanId}/transactions`;
    if (loanId === MOCK_IDS.existingLoanId) {
      return response(mockState.existingLoanTransactions, 'GET', path);
    }
    if (loanId === MOCK_IDS.newLoanId) {
      return response(mockState.newLoanTransactions, 'GET', path);
    }
    return response([], 'GET', path);
  },

  async calculateDiscount(loanId) {
    ensureState();
    await delay(300);
    const path = `/loan/v1/loans/${loanId}/calculate-discount`;
    return response(MOCK_DISCOUNT_CALCULATION, 'GET', path);
  },

  async createPrepayPayment(dto) {
    ensureState();
    await delay(800);
    const path = '/loan/v1/prepay-payments';
    const payoffAmount = mockState.existingLoan.balance;

    const tx = {
      id: 'tx-payoff-001',
      loanId: dto.loanId,
      date: new Date().toISOString().split('T')[0],
      status: 'SETTLED',
      type: 'PREPAY',
      method: 'JOURNAL',
      amount: payoffAmount,
      principal: mockState.existingLoan.principalBalance,
      interest: mockState.existingLoan.interestBalance,
      currency: { currencyCode: 'USD', symbol: '$' },
      accountId: dto.accountId,
      idempotencyId: dto.idempotencyId || 'idem-payoff-001',
      createdAt: new Date().toISOString(),
    };

    mockState.existingLoan.balance = 0;
    mockState.existingLoan.pendingBalance = 0;
    mockState.existingLoan.principalBalance = 0;
    mockState.existingLoan.interestBalance = 0;
    mockState.existingLoan.pendingPrincipalBalance = 0;
    mockState.existingLoan.pendingInterestBalance = 0;
    mockState.existingLoan.state = 'PAID_CLOSED';
    mockState.existingLoanTransactions.push(tx);

    mockState.existingLoanAccount.balance = 0;
    mockState.existingLoanAccount.pendingBalance = 0;
    mockState.existingLoanAccount.postedPrincipalBalance = 0;
    mockState.existingLoanAccount.postedInterestBalance = 0;
    mockState.existingLoanAccount.pendingPrincipalBalance = 0;
    mockState.existingLoanAccount.pendingInterestBalance = 0;
    mockState.existingLoanAccount.closedAt = new Date().toISOString();

    mockState.payoffTransaction = tx;

    return response(tx, 'POST', path, dto, 201);
  },

  async createFundingPayment(dto) {
    ensureState();
    await delay(700);
    const path = '/loan/v1/funding-payments';
    const disbursementAmount = mockState.newLoan.principal - MOCK_EXISTING_LOAN.balance;

    const tx = {
      id: 'tx-fund-001',
      loanId: dto.loanId,
      date: new Date().toISOString().split('T')[0],
      status: 'SETTLED',
      type: 'FUNDING',
      method: dto.method || 'RTP',
      amount: disbursementAmount,
      principal: disbursementAmount,
      interest: 0,
      currency: { currencyCode: 'USD', symbol: '$' },
      accountId: dto.accountId,
      idempotencyId: dto.idempotencyId || 'idem-fund-refi-001',
      createdAt: new Date().toISOString(),
    };

    mockState.newLoan.state = 'NORMAL';
    mockState.newLoanTransactions.push(tx);
    mockState.fundingTransaction = tx;

    return response(tx, 'POST', path, dto, 201);
  },
};

export const mockFinxactService = {
  async getLoanAccount(id) {
    ensureState();
    await delay();
    const path = `/finxact/v1/loan-accounts/${id}`;
    if (id === MOCK_IDS.existingLoanAccountId) {
      return response(mockState.existingLoanAccount, 'GET', path);
    }
    if (id === MOCK_IDS.newLoanAccountId && mockState.newLoanAccount) {
      return response(mockState.newLoanAccount, 'GET', path);
    }
    return { data: { error: 'Account not found' }, status: 404, duration: 300, method: 'GET', path, ok: false };
  },

  async createLoanAccount(dto) {
    ensureState();
    await delay(500);
    const path = '/finxact/v1/loan-accounts';
    const selectedOffer = MOCK_OFFERS.find(o => o.id === dto.offerId) || MOCK_OFFERS[0];
    const account = createMockNewLoanAccount(selectedOffer);
    mockState.newLoanAccount = account;
    return response(account, 'POST', path, dto, 201);
  },

  async getLoanTransactions(id) {
    ensureState();
    await delay(300);
    const path = `/finxact/v1/loan-accounts/${id}/loan-transactions`;
    if (id === MOCK_IDS.existingLoanAccountId) {
      return response(mockState.existingLoanTransactions, 'GET', path);
    }
    if (id === MOCK_IDS.newLoanAccountId) {
      return response(mockState.newLoanTransactions, 'GET', path);
    }
    return response([], 'GET', path);
  },

  async createFundingPayment(dto) {
    ensureState();
    await delay(600);
    const path = '/finxact/v1/funding-payments';
    const result = {
      loanTransactionId: 'fx-tx-fund-001',
      loanAccountId: dto.loanAccountId,
      principalAmount: dto.principalAmount,
      interestAmount: dto.interestAmount,
      method: dto.method,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };
    return response(result, 'POST', path, dto, 201);
  },

  async createPaymentOrder(dto) {
    ensureState();
    await delay(700);
    const path = '/finxact/v1/payment-orders';
    const order = {
      id: 'po-refi-001',
      idempotencyId: dto.idempotencyId,
      originatingAccountId: dto.originatingAccountId,
      receivingExternalAccountId: dto.receivingExternalAccountId,
      network: dto.network,
      direction: dto.direction,
      amount: dto.amount,
      status: 'COMPLETED',
      transactionId: 'fx-tx-po-001',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    mockState.paymentOrder = order;
    return response(order, 'POST', path, dto, 201);
  },
};

export const mockBamService = {
  async getShopAccounts(shopId) {
    ensureState();
    await delay(300);
    const path = `/bank-account-manager/v2/shops/${shopId}/accounts`;
    const accounts = MOCK_MERCHANT_BANK_ACCOUNTS.map(a => ({
      ...a,
      ...mockState.bankAccountOverrides[a.id],
    }));
    return response(accounts, 'GET', path);
  },

  async getAccount(accountId) {
    ensureState();
    await delay(300);
    const path = `/bank-account-manager/v2/accounts/${accountId}`;
    const account = MOCK_MERCHANT_BANK_ACCOUNTS.find(a => a.id === accountId);
    if (account) {
      const merged = { ...account, ...mockState.bankAccountOverrides[accountId] };
      return response(merged, 'GET', path);
    }
    return { data: { error: 'Account not found' }, status: 404, duration: 300, method: 'GET', path, ok: false };
  },

  async verifyBankAccountViaPlaid(accountId) {
    ensureState();
    await delay(1500);
    const path = `/v2/bank-accounts/${accountId}/verify/plaid`;
    const account = MOCK_MERCHANT_BANK_ACCOUNTS.find(a => a.id === accountId);
    if (account) {
      const newVerifiedAt = new Date().toISOString();
      mockState.bankAccountOverrides[accountId] = { lastVerifiedAt: newVerifiedAt };
      return response(
        { ...account, lastVerifiedAt: newVerifiedAt },
        'POST',
        path,
        { accountId },
        200
      );
    }
    return { data: { error: 'Account not found' }, status: 404, duration: 300, method: 'POST', path, ok: false };
  },
};

export const mockOrchestrationService = {
  async getOffers(shopId) {
    ensureState();
    await delay(400);
    const path = `/v1/offers?shopId=${shopId}`;
    return response(MOCK_OFFERS, 'GET', path);
  },

  async approveAndFund(loanId, bankAccountId) {
    ensureState();
    await delay(800);
    const path = `/v1/loans/${loanId}/approve-and-fund?bankAccountId=${bankAccountId}`;
    if (mockState.newLoan) {
      mockState.newLoan.state = 'PENDING_FUNDING';
    }
    return response({ loanId, bankAccountId, status: 'FUNDED' }, 'POST', path, null, 200);
  },
};
