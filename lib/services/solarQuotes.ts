import { supabase } from '@/lib/supabase'
import type { SolarQuote, InsertSolarQuote } from '@/types/database.types'

export interface QuoteFormData {
  type?: 'written' | 'call_visit'
  name: string
  email: string
  phone?: string
  location: string
  state: string
  budgetRange: string
  propertyType: string
  roofType?: string
  energyUsage?: number
}

export interface QuoteResponse {
  data: SolarQuote | null
  error: Error | null
}

export interface QuotesResponse {
  data: SolarQuote[] | null
  error: Error | null
}

// Create a new solar quote
export const createSolarQuote = async (
  quoteData: QuoteFormData,
  userId?: string
): Promise<QuoteResponse> => {
  try {
    // Calculate estimates based on form data
    const estimates = calculateEstimates(quoteData)
    
    const insertData: InsertSolarQuote = {
      type: quoteData.type || 'written',
      user_id: userId || 'anonymous',
      name: quoteData.name,
      email: quoteData.email,
      phone: quoteData.phone || null,
      location: quoteData.location,
      state: quoteData.state,
      budget_range: quoteData.budgetRange,
      property_type: quoteData.propertyType,
      roof_type: quoteData.roofType || null,
      energy_usage: quoteData.energyUsage || null,
      system_size: estimates.systemSize,
      estimated_cost: estimates.cost,
      estimated_savings: estimates.savings,
      rebate_amount: estimates.rebate,
      status: 'pending',
      contact_revealed: quoteData.type === 'call_visit' 
    }

    const { data, error } = await supabase
      .from('solar_quotes')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Get quotes for a user
export const getUserQuotes = async (userId: string): Promise<QuotesResponse> => {
  try {
    const { data, error } = await supabase
      .from('solar_quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Update quote status
export const updateQuoteStatus = async (
  quoteId: string,
  status: 'pending' | 'quoted' | 'contacted' | 'completed'
): Promise<QuoteResponse> => {
  try {
    const { data, error } = await supabase
      .from('solar_quotes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', quoteId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// Calculate estimates based on location and requirements
const calculateEstimates = (quoteData: QuoteFormData) => {
  const budgetRanges = {
    '5000-10000': { min: 5000, max: 10000 },
    '10000-20000': { min: 10000, max: 20000 },
    '20000-30000': { min: 20000, max: 30000 },
    '30000+': { min: 30000, max: 50000 }
  }

  const budget = budgetRanges[quoteData.budgetRange as keyof typeof budgetRanges]
  const avgBudget = (budget.min + budget.max) / 2

  // Estimate system size based on budget (roughly $1500 per kW)
  const systemSize = Math.round((avgBudget / 1500) * 10) / 10

  // State-based rebate calculations (simplified)
  const stateRebates = {
    'NSW': systemSize * 500,
    'VIC': systemSize * 480,
    'QLD': systemSize * 520,
    'WA': systemSize * 450,
    'SA': systemSize * 490,
    'TAS': systemSize * 460,
    'ACT': systemSize * 510,
    'NT': systemSize * 440
  }

  const rebate = stateRebates[quoteData.state as keyof typeof stateRebates] || systemSize * 480

  // Annual savings estimate (roughly $400 per kW)
  const savings = Math.round(systemSize * 400)

  return {
    systemSize,
    cost: avgBudget,
    savings,
    rebate: Math.round(rebate)
  }
}

// Real-time subscription for quote updates
export const subscribeToQuoteUpdates = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('quote_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'solar_quotes',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}