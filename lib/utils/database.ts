import { supabase } from '@/lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

// Generic error handler for database operations
export const handleDatabaseError = (error: PostgrestError | Error | null, operation: string) => {
  if (!error) return null

  console.error(`Database error during ${operation}:`, error)
  
  // Handle specific Supabase errors
  if ('code' in error) {
    switch (error.code) {
      case 'PGRST116':
        return new Error('No data found')
      case 'PGRST301':
        return new Error('Unauthorized access')
      case '23505':
        return new Error('Data already exists')
      case '23503':
        return new Error('Referenced data not found')
      default:
        return new Error(`Database error: ${error.message}`)
    }
  }

  return error
}

// Retry mechanism for database operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt === maxRetries) {
        break
      }

      console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}):`, lastError.message)
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

// Real-time subscription manager
export class SubscriptionManager {
  private subscriptions = new Map<string, any>()

  subscribe(
    key: string,
    table: string,
    callback: (payload: any) => void,
    filter?: string
  ) {
    // Remove existing subscription if any
    this.unsubscribe(key)

    const channel = supabase
      .channel(`${key}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter })
        },
        callback
      )
      .subscribe()

    this.subscriptions.set(key, channel)
    
    console.log(`Subscribed to ${table} changes with key: ${key}`)
    return channel
  }

  unsubscribe(key: string) {
    const subscription = this.subscriptions.get(key)
    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(key)
      console.log(`Unsubscribed from changes with key: ${key}`)
    }
  }

  unsubscribeAll() {
    for (const [key] of this.subscriptions) {
      this.unsubscribe(key)
    }
  }
}

// Global subscription manager instance
export const subscriptionManager = new SubscriptionManager()

// Database status checking function
export const getDatabaseStatus = async (): Promise<{
  connected: boolean;
  error?: string;
  timestamp: string;
}> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    
    return {
      connected: !error,
      error: error?.message,
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Cleanup subscriptions on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.unsubscribeAll()
  })
}