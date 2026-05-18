import * as Storage from './storage'

const TOKEN_KEY = 'maka.session.token'

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string[]>
  payload?: unknown
  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.status = status
    this.payload = payload
    if (payload && typeof payload === 'object' && 'fieldErrors' in payload) {
      this.fieldErrors = (payload as { fieldErrors?: Record<string, string[]> }).fieldErrors
    }
  }
}

export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not set. Add it to your .env (see .env.example).',
    )
  }
  return url.replace(/\/$/, '')
}

export async function getToken(): Promise<string | null> {
  return Storage.getItem(TOKEN_KEY)
}

export async function setToken(token: string): Promise<void> {
  await Storage.setItem(TOKEN_KEY, token)
}

export async function clearToken(): Promise<void> {
  await Storage.removeItem(TOKEN_KEY)
}

type RequestOptions = RequestInit & {
  auth?: boolean
  json?: unknown
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, json, headers: extraHeaders, ...rest } = options
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${base}${path}`

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(extraHeaders as Record<string, string> | undefined),
  }

  if (auth) {
    const token = await getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let body = rest.body
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  }

  const res = await fetch(url, { ...rest, headers, body })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

  if (!res.ok) {
    const message =
      (isJson && payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Request failed (${res.status})`
    throw new ApiError(message, res.status, payload)
  }

  return payload as T
}
