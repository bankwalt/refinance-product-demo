import { apiRequest } from './apiClient';

export const orchestrationService = {
  generateOffer(applicationId, productApplicationId) {
    return apiRequest(
      'POST',
      `/v1/offers/generate?application-id=${applicationId}&product-application-id=${productApplicationId}`
    );
  },

  getOffers(shopId) {
    return apiRequest('GET', `/v1/offers?shopId=${shopId}`);
  },

  approveAndFund(loanId, bankAccountId) {
    return apiRequest(
      'POST',
      `/v1/loans/${loanId}/approve-and-fund?bankAccountId=${bankAccountId}`
    );
  },

  approveOffer(productApplicationId, offerId) {
    return apiRequest(
      'POST',
      `/v2/applications/products/${productApplicationId}/offers/${offerId}/approve`
    );
  },
};
