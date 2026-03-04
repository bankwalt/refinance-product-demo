import { apiRequest } from './apiClient';

export const loanService = {
  getLoan(loanId) {
    return apiRequest('GET', `/loan/v1/loans/${loanId}`);
  },

  createLoan(dto) {
    return apiRequest('POST', '/loan/v1/loans', dto);
  },

  approveLoan(loanId) {
    return apiRequest('POST', `/loan/v1/loans/${loanId}/approve`);
  },

  modifyLoan(loanId, dto) {
    return apiRequest('POST', `/loan/v1/loans/${loanId}/modify`, dto);
  },

  getLoanTransactions(loanId) {
    return apiRequest('GET', `/loan/v1/loans/${loanId}/transactions`);
  },

  calculateDiscount(loanId) {
    return apiRequest('GET', `/loan/v1/loans/${loanId}/calculate-discount`);
  },

  createPrepayPayment(dto) {
    return apiRequest('POST', '/loan/v1/prepay-payments', dto);
  },

  createFundingPayment(dto) {
    return apiRequest('POST', '/loan/v1/funding-payments', dto);
  },

  createDiscountPayment(dto) {
    return apiRequest('POST', '/loan/v1/discount-payments', dto);
  },
};
