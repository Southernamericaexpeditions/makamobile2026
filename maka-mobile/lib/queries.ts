import { apiFetch } from './api'
import type {
  Business, DigitalCard, LandlordDashboard, LandlordTenant, PaymentRow, Payout,
  PropertyDetail, Split, TenantDashboard, TokenTransactionRow,
} from './types'

export const queries = {
  tenantDashboard: () =>
    apiFetch<TenantDashboard>('/api/me/dashboard'),

  landlordDashboard: () =>
    apiFetch<LandlordDashboard>('/api/me/dashboard'),

  myProperties: () =>
    apiFetch<{ properties: PropertyDetail[] }>('/api/me/properties'),

  myPayments: (limit: number = 50) =>
    apiFetch<{ payments: PaymentRow[] }>(`/api/me/payments?limit=${limit}`),

  myTransactions: (limit: number = 50) =>
    apiFetch<{ transactions: TokenTransactionRow[] }>(`/api/me/transactions?limit=${limit}`),

  myTokens: () =>
    apiFetch<{ balance: number; thisMonth: number }>('/api/me/tokens'),

  myCard: () =>
    apiFetch<DigitalCard>('/api/me/card'),

  myBusinesses: () =>
    apiFetch<{ businesses: Business[] }>('/api/me/businesses'),

  mySplits: () =>
    apiFetch<{ splits: Split[] }>('/api/me/splits'),

  myPayouts: (limit: number = 50) =>
    apiFetch<{ payouts: Payout[] }>(`/api/me/payouts?limit=${limit}`),

  myTenants: () =>
    apiFetch<{ tenants: LandlordTenant[] }>('/api/me/tenants'),
}
