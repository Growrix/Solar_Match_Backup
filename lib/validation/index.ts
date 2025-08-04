// Export all validation schemas
export * from './schemas'

// Re-export types for convenience
export type { z } from 'zod'

// Type inference helpers
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>
export type UserRegistration = z.infer<typeof UserRegistrationSchema>
export type InstallerRegistration = z.infer<typeof InstallerRegistrationSchema>
export type ChatMessage = z.infer<typeof ChatMessageSchema>
export type BidSubmission = z.infer<typeof BidSubmissionSchema>

import { z } from 'zod'
import { QuoteRequestSchema, UserRegistrationSchema, InstallerRegistrationSchema, ChatMessageSchema, BidSubmissionSchema } from './schemas'
