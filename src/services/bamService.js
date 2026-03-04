import { apiRequest } from './apiClient';

export const bamService = {
  getShopAccounts(shopId) {
    return apiRequest('GET', `/bank-account-manager/v2/shops/${shopId}/accounts`);
  },

  getAccount(accountId) {
    return apiRequest('GET', `/bank-account-manager/v2/accounts/${accountId}`);
  },

  createSettlementAccount(dto) {
    return apiRequest('POST', '/bank-account-manager/v1/settlement-accounts', dto);
  },
};
