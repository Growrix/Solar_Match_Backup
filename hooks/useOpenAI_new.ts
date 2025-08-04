'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const sendMessage = useCallback(async (
    message: string, 
  ): Promise<string | null> => {
    if (!user) {
      setError('Authentication required')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {},
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      return data.message || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return {
    sendMessage,
    isLoading,
    error,
  }
}
