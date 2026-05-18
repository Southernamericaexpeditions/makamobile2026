import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, clearToken } from './api'
import { router } from 'expo-router'

type State<T> = {
  data: T | null
  error: string | null
  loading: boolean
  refresh: () => Promise<void>
  setData: (next: T | null) => void
}

export function useApi<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []): State<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    setError(null)
    try {
      const res = await fetcherRef.current()
      setData(res)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await clearToken()
        router.replace('/(auth)/login')
        return
      }
      setError(err instanceof ApiError ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run() }, deps)

  const refresh = useCallback(async () => {
    setLoading(true)
    await run()
  }, [run])

  return { data, error, loading, refresh, setData }
}
