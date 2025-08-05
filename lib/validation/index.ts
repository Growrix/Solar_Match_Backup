// Export all validation schemas
export * from './schemas'
export * from './chat'

// Re-export types for convenience
export type { z } from 'zod'

// Type inference helpers - Basic schemas
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>
export type UserRegistration = z.infer<typeof UserRegistrationSchema>
export type InstallerRegistration = z.infer<typeof InstallerRegistrationSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type BidSubmission = z.infer<typeof BidSubmissionSchema>

// Type inference helpers - Enhanced AI Chat schemas
export type {
  EnhancedMessageType,
  UserActivityTracking,
  EnhancedQuoteData,
  EnhancedInstallerData,
  EnhancedBidData,
  EnhancedChatContext,
  AIEnhancedChatMessage,
  AIEnhancedChatRequest,
  AIEnhancedChatResponse,
  ContextualAIAnalysis
} from './chat'

import { z } from 'zod'
import { QuoteRequestSchema, UserRegistrationSchema, InstallerRegistrationSchema, ChatMessageSchema, BidSubmissionSchema } from './schemas'
