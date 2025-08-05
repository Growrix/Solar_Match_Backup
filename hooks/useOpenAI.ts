'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  messageType?: 'general' | 'quote_summary' | 'bid_coach' | 'system_insight'
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface QuoteData {
  id: string
  systemSize: number
  propertyType: string
  totalCost: number
  panelBrand?: string
  inverterBrand?: string
  warrantyYears?: number
}

interface BidData {
  id: string
  cost: number
  installerName: string
  timeframe: string
}

interface UserActivity {
  recentQuotes: Array<{
    id: string
    status: string
    cost: number
    systemSize: number
  }>
  pageViews: string[]
  lastLogin: Date
}

interface ChatContext {
  quoteId?: string
  systemSize?: number
  propertyType?: string
  userType?: 'homeowner' | 'installer'
  currentPage?: string
  recentQuotes?: Array<{
    id: string
    status: string
    cost: number
    systemSize: number
  }>
  biddingStatus?: {
    activeBids: number
    highestBid: number
    timeRemaining: string
  }
}

interface EnhancedAIResponse {
  message: string
  messageType: 'general' | 'quote_summary' | 'bid_coach' | 'system_insight'
  suggestions?: string[]
  actionButtons?: Array<{
    label: string
    action: string
    style: 'primary' | 'secondary'
  }>
  relatedQuotes?: string[]
  confidence?: number
}

export function useOpenAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const { user } = useAuth()

  const sendMessage = useCallback(async (
    message: string, 
    chatHistory: ChatMessage[] = [],
    context?: ChatContext,
    enableStreaming: boolean = false
  ): Promise<EnhancedAIResponse | null> => {
    if (!user) {
      setError('Authentication required')
      return null
    }

    setIsLoading(true)
    setError(null)
    
    if (enableStreaming) {
      setIsStreaming(true)
    }

    try {
      const requestBody = {
        message,
        chatHistory: chatHistory.slice(-10), // Last 10 messages for context
        context: {
          ...context,
          userType: user.user_metadata?.user_type || 'homeowner',
          currentPage: window.location.pathname,
        },
        enableStreaming,
        features: {
          quoteSummary: true,
          bidCoaching: true,
          contentModeration: true,
          contextualInsights: true
        }
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response')
      }

      return {
        message: data.message,
        messageType: data.messageType || 'general',
        suggestions: data.suggestions,
        actionButtons: data.actionButtons,
        relatedQuotes: data.relatedQuotes,
        confidence: data.confidence
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [user])

  const summarizeQuote = useCallback(async (
    quoteId: string,
    quoteData: QuoteData
  ): Promise<string | null> => {
    return sendMessage(
      `Please summarize this quote for me: ${JSON.stringify(quoteData)}`,
      [],
      { 
        quoteId,
        systemSize: quoteData.systemSize,
        propertyType: quoteData.propertyType 
      }
    ).then(response => response?.message || null)
  }, [sendMessage])

  const getBidCoaching = useCallback(async (
    currentBids: BidData[]
  ): Promise<EnhancedAIResponse | null> => {
    return sendMessage(
      `I'm reviewing bids for my solar installation. Can you help me analyze these offers and provide coaching?`,
      [],
      {
        biddingStatus: {
          activeBids: currentBids.length,
          highestBid: Math.max(...currentBids.map(b => b.cost)),
          timeRemaining: '2 days'
        }
      }
    )
  }, [sendMessage])

  const getContextualInsight = useCallback(async (
    pageContext: string,
    userActivity: UserActivity
  ): Promise<EnhancedAIResponse | null> => {
    return sendMessage(
      `Based on my current activity, what insights can you provide?`,
      [],
      {
        currentPage: pageContext,
        recentQuotes: userActivity.recentQuotes
      }
    )
  }, [sendMessage])

  return {
    sendMessage,
    summarizeQuote,
    getBidCoaching,
    getContextualInsight,
    isLoading,
    isStreaming,
    error,
  }
}
