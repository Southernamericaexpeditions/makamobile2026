import { apiFetch, clearToken, setToken } from './api'

export type Role = 'TENANT' | 'LANDLORD'

export type AuthUser = {
  id: string
  email: string
  role: Role
  name: string | null
  onboardingComplete: boolean
}

type AuthResponse = {
  token: string
  user: AuthUser
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    auth: false,
    json: { email, password },
  })
  await setToken(res.token)
  return res.user
}

export async function signup(input: {
  name: string
  email: string
  password: string
  role: Role
}): Promise<AuthUser> {
  const res = await apiFetch<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    auth: false,
    json: input,
  })
  await setToken(res.token)
  return res.user
}

export async function logout(): Promise<void> {
  await clearToken()
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    auth: false,
    json: { email },
  })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    auth: false,
    json: { token, password },
  })
}

export type MeResponse = AuthUser & {
  stripeOnboardingComplete: boolean
  paypalEmail: string | null
  bankName: string | null
  bankAccountHolder: string | null
  bankAccountNumber: string | null
  bankEmail: string | null
}

export async function fetchMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/auth/me')
}
