import { supabase } from '@/lib/supabase'
import type { NewsletterSubscriber, InsertNewsletterSubscriber } from '@/types/database.types'

export interface NewsletterResponse {
  data: NewsletterSubscriber | null
  error: Error | null
}

// Subscribe to newsletter
export const subscribeToNewsletter = async (email: string): Promise<NewsletterResponse> => {
  try {
    // Check if email already exists - use maybeSingle() to handle no results gracefully
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (checkError) throw checkError

    if (existing) {
      // Update subscription status if exists
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          subscribed: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('email', email)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } else {
      // Create new subscription
      const insertData: InsertNewsletterSubscriber = {
        email,
        subscribed: true
      }

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (email: string): Promise<NewsletterResponse> => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        subscribed: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('email', email)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}