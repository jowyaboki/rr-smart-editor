export interface SubscriptionProvider {
  createCustomer: (orgId: string) => Promise<string>;
  getInvoiceHistory: (orgId: string) => Promise<any[]>;
}

export interface PaymentProvider {
  processPayment: (customerId: string, amount: number) => Promise<boolean>;
}

export const billingService = {
  createCustomer: async (orgId: string) => `customer-${orgId}`,
  getInvoiceHistory: async (orgId: string) => [],
};
export const paymentService = {
  processPayment: async (customerId: string, amount: number) => true,
};
