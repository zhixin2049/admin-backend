import { httpBatchLink, loggerLink } from '@trpc/client'
import { trpc } from './trpc'
import { useState } from 'react'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return 'http://localhost:3001/api/trpc'
  return 'http://localhost:3001/api/trpc'
}

export function useTRPCClient() {
  const [token] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || ''
    }
    return ''
  })

  const client = trpc.createClient({
    links: [
      loggerLink(),
      httpBatchLink({
        url: getBaseUrl(),
        headers() {
          if (token) {
            return { authorization: `Bearer ${token}` }
          }
          return {}
        },
      }),
    ],
  })

  return client
}
