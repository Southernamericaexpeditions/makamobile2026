// Mirrors of the JSON shapes returned by maka-web's /api/me/* endpoints.
// Keep in sync with src/app/api/me/* in the maka repo.

export type Role = 'TENANT' | 'LANDLORD'

export type PaymentMethod = 'CARD' | 'ACH' | 'PAYPAL' | 'PAYPHONE'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'LATE'
export type PayoutStatus = 'PENDING' | 'PROCESSED'
export type TokenTransactionType =
  | 'EARN' | 'REDEEM' | 'PURCHASE' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'SPEND'
export type RentSplitStatus = 'PENDING' | 'PARTIAL' | 'COMPLETE'
export type SplitParticipantStatus = 'INVITED' | 'ACCEPTED' | 'PAID'

export type LandlordRef = { id: string; name: string | null; email: string }
export type TenantRef = { id: string; name: string | null; email: string }

export type DashboardProperty = {
  id: string
  address: string
  unit: string | null
  monthlyRent: number
  dueDay: number
  landlord: LandlordRef | null
}

export type RecentPayment = {
  id: string
  title: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt: string | null
  createdAt: string
  tokensEarned: number
}

export type RecentTransaction = {
  id: string
  type: TokenTransactionType
  amount: number
  description: string | null
  createdAt: string
}

export type DashboardSplit = {
  id: string
  propertyAddress: string
  totalAmount: number
  collected: number
  dueDate: string
  myShare: number
  myStatus: SplitParticipantStatus
}

export type TenantDashboard = {
  role: 'TENANT'
  user: { id: string; email: string }
  properties: DashboardProperty[]
  rent: {
    amount: number
    currency: 'USD'
    dueDate: string
    daysLeft: number
  } | null
  tokens: { balance: number; thisMonth: number }
  recentPayments: RecentPayment[]
  recentTransactions: RecentTransaction[]
  splits: DashboardSplit[]
}

export type LandlordPropertySummary = {
  id: string
  address: string
  unit: string | null
  monthlyRent: number
  dueDay: number
  status: 'paid' | 'due' | 'late' | 'vacant'
  dueIn: number | null
  tenant: TenantRef | null
}

export type LandlordDashboard = {
  role: 'LANDLORD'
  user: { id: string; email: string }
  summary: { units: number; occupied: number; mtd: number; pending: number }
  properties: LandlordPropertySummary[]
  payouts: Array<{
    id: string
    amount: number
    netAmount: number
    fee: number
    status: PayoutStatus
    createdAt: string
  }>
}

export type Dashboard = TenantDashboard | LandlordDashboard

export type PaymentRow = {
  id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  dueDate: string
  paidAt: string | null
  tokensEarned: number
  createdAt: string
  property: { address: string; unit: string | null }
  tenant?: TenantRef
}

export type TokenTransactionRow = {
  id: string
  type: TokenTransactionType
  amount: number
  description: string | null
  referenceId: string | null
  createdAt: string
}

export type DigitalCard = {
  id: string
  cardNumber: string
  isActive: boolean
  createdAt: string
}

export type Business = {
  id: string
  name: string
  category: string
  emoji: string
}

export type Split = {
  id: string
  property: { address: string; unit: string | null }
  totalAmount: number
  collected: number
  dueDate: string
  status: RentSplitStatus
  creator: { id: string; name: string | null; email: string }
  amICreator: boolean
  myShare: number | null
  myStatus: SplitParticipantStatus | null
  participants: Array<{
    id: string
    email: string
    userId: string | null
    amount: number
    status: SplitParticipantStatus
    paidAt: string | null
  }>
}

export type PropertyDetail = {
  id: string
  address: string
  unit: string | null
  monthlyRent: number
  dueDay: number
  description: string | null
  landlord?: LandlordRef | null
  photos: Array<{ id: string; url: string; caption: string | null }>
  // Landlord-only fields
  listingStatus?: 'UNLISTED' | 'LISTED'
  city?: string | null
  neighborhood?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  sqftArea?: number | null
  tenants?: TenantRef[]
}

export type Payout = {
  id: string
  amount: number
  fee: number
  netAmount: number
  status: PayoutStatus
  createdAt: string
  paidAt: string | null
  property: { id: string; address: string; unit: string | null }
}

export type LandlordTenant = {
  tenantPropertyId: string
  tenant: TenantRef
  property: { id: string; address: string; unit: string | null; monthlyRent: number; dueDay: number }
  status: 'paid' | 'due' | 'late'
  nextDueDate: string
  lastPaymentAt: string | null
}
