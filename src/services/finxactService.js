import { apiRequest } from './apiClient';

export const finxactService = {
  getLoanAccount(id) {
    return apiRequest('GET', `/finxact/v1/loan-accounts/${id}`);
  },

  createLoanAccount(dto) {
    return apiRequest('POST', '/finxact/v1/loan-accounts', dto);
  },

  modifyLoanAccount(id, dto) {
    return apiRequest('POST', `/finxact/v1/loan-accounts/${id}/modify`, dto);
  },

  getLoanTransactions(id, params = {}) {
    const query = new URLSearchParams(params).toString();
    const path = `/finxact/v1/loan-accounts/${id}/loan-transactions${query ? '?' + query : ''}`;
    return apiRequest('GET', path);
  },

  createFundingPayment(dto) {
    return apiRequest('POST', '/finxact/v1/funding-payments', dto);
  },

  createPaymentOrder(dto) {
    return apiRequest('POST', '/finxact/v1/payment-orders', dto);
  },

  getPaymentOrder(id) {
    return apiRequest('GET', `/finxact/v1/payment-orders/${id}`);
  },

  createDiscountPayment(dto) {
    return apiRequest('POST', '/finxact/v1/discount-payments', dto);
  },
};
