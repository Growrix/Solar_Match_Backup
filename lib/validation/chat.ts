import { z } from 'zod'

// Enhanced chat message types (extended from basic chat)
export const EnhancedMessageTypeSchema = z.enum(['general', 'quote_summary', 'bid_coaching', 'contextual_insight'], {
  message: 'Invalid message type'
})

// User activity tracking for enhanced context
export const UserActivityTrackingSchema = z.object({
  lastActiveTime: z.date().optional(),
  sessionDuration: z.number().min(0).optional(),
  pagesVisited: z.array(z.string()).optional(),
  actionsPerformed: z.array(z.string()).optional(),
})

// Enhanced quote data validation for AI context
export const EnhancedQuoteDataSchema = z.object({
  id: z.string().uuid('Invalid quote ID'),
  system_size: z.number().min(1, 'System size must be at least 1kW').max(50, 'System size too large'),
  estimated_cost: z.number().min(1000, 'Cost must be at least $1,000').max(100000, 'Cost too high'),
  installation_timeline: z.string().optional(),
  equipment_details: z.object({
    panels: z.string().optional(),
    inverter: z.string().optional(),
    battery: z.string().optional(),
  }).optional(),
  property_details: z.object({
    address: z.string().optional(),
    postcode: z.string().regex(/^[0-9]{4}$/).optional(),
    roof_type: z.string().optional(),
    orientation: z.string().optional(),
  }).optional(),
  energy_requirements: z.object({
    annual_usage: z.number().min(0).optional(),
    peak_usage: z.number().min(0).optional(),
    current_bill: z.number().min(0).optional(),
  }).optional(),
})

// Enhanced installer data validation
export const EnhancedInstallerDataSchema = z.object({
  id: z.string().uuid('Invalid installer ID'),
  company_name: z.string().min(1, 'Company name required').max(100, 'Company name too long'),
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
  reviews_count: z.number().min(0).optional(),
  certification_level: z.string().optional(),
  years_experience: z.number().min(0).optional(),
  service_areas: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
})

// Enhanced bid data validation
export const EnhancedBidDataSchema = z.object({
  id: z.string().uuid('Invalid bid ID'),
  quote_id: z.string().uuid('Invalid quote ID'),
  installer_id: z.string().uuid('Invalid installer ID'),
  offer_price: z.number().min(1000, 'Offer must be at least $1,000').max(100000, 'Offer too high'),
  install_time: z.string().optional(),
  warranty_years: z.number().min(5).max(30).optional(),
  system_details: z.object({
    panel_brand: z.string().optional(),
    panel_count: z.number().min(1).optional(),
    inverter_brand: z.string().optional(),
    battery_included: z.boolean().optional(),
  }).optional(),
  additional_services: z.array(z.string()).optional(),
  terms_conditions: z.string().optional(),
  valid_until: z.date().optional(),
})

// Enhanced chat context validation
export const EnhancedChatContextSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  userType: z.enum(['homeowner', 'installer'], { message: 'Invalid user type' }),
  sessionId: z.string().optional(),
  userActivity: UserActivityTrackingSchema.optional(),
  currentQuotes: z.array(EnhancedQuoteDataSchema).optional(),
  activeBids: z.array(EnhancedBidDataSchema).optional(),
  installerProfile: EnhancedInstallerDataSchema.optional(),
  preferences: z.object({
    budget_range: z.string().optional(),
    preferred_brands: z.array(z.string()).optional(),
    timeline_preference: z.string().optional(),
    communication_method: z.string().optional(),
  }).optional(),
})

// Enhanced chat message validation (extends basic ChatMessageSchema)
export const AIEnhancedChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], { message: 'Invalid message role' }),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long')
    .refine(
      (content) => {
        // Content moderation - check for inappropriate content
        const inappropriateWords = ['spam', 'scam', 'fake', 'illegal']
        const lowerContent = content.toLowerCase()
        return !inappropriateWords.some(word => lowerContent.includes(word))
      },
      { message: 'Message contains inappropriate content' }
    ),
  timestamp: z.date().optional(),
  messageType: EnhancedMessageTypeSchema.optional(),
  metadata: z.object({
    quoteId: z.string().uuid().optional(),
    installerId: z.string().uuid().optional(),
    actionType: z.string().optional(),
    confidence: z.number().min(0).max(1).optional(),
  }).optional(),
})

// Enhanced chat request validation
export const AIEnhancedChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long'),
  chatHistory: z.array(AIEnhancedChatMessageSchema).optional(),
  context: EnhancedChatContextSchema.optional(),
  messageType: EnhancedMessageTypeSchema.optional(),
  features: z.object({
    quoteSummary: z.boolean().default(false),
    bidCoaching: z.boolean().default(false),
    contentModeration: z.boolean().default(true),
    contextualInsights: z.boolean().default(false),
    enableStreaming: z.boolean().default(false),
  }).optional(),
  quoteData: EnhancedQuoteDataSchema.optional(),
  bidData: EnhancedBidDataSchema.optional(),
  installerData: EnhancedInstallerDataSchema.optional(),
})

// Enhanced chat response validation
export const AIEnhancedChatResponseSchema = z.object({
  content: z.string().min(1, 'Response cannot be empty'),
  messageType: EnhancedMessageTypeSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  actionButtons: z.array(z.object({
    label: z.string().min(1, 'Button label required'),
    action: z.string().min(1, 'Button action required'),
    variant: z.enum(['primary', 'secondary', 'outline']).optional(),
  })).optional(),
  suggestions: z.array(z.string()).optional(),
  relatedQuotes: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    summary: z.string(),
  })).optional(),
  metadata: z.object({
    processingTime: z.number().optional(),
    tokensUsed: z.number().optional(),
    model: z.string().optional(),
  }).optional(),
})

// Contextual AI request validation
export const ContextualAIAnalysisSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(1000, 'Prompt too long'),
  contextType: z.enum(['quote_analysis', 'bid_coaching', 'installer_comparison', 'system_optimization'], {
    message: 'Invalid context type'
  }),
  quote: EnhancedQuoteDataSchema.optional(),
  installer: EnhancedInstallerDataSchema.optional(),
  biddingContext: z.object({
    currentBids: z.array(EnhancedBidDataSchema).optional(),
    biddingStatus: z.string().optional(),
    competitorCount: z.number().min(0).optional(),
    marketContext: z.object({
      averagePrice: z.number().optional(),
      priceRange: z.object({
        min: z.number(),
        max: z.number(),
      }).optional(),
      demandLevel: z.enum(['low', 'medium', 'high']).optional(),
    }).optional(),
  }).optional(),
  userContext: z.object({
    location: z.string().optional(),
    preferences: z.object({
      budget: z.number().optional(),
      timeline: z.string().optional(),
      priorities: z.array(z.string()).optional(),
    }).optional(),
    previousQuotes: z.array(EnhancedQuoteDataSchema).optional(),
  }).optional(),
})

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

export const sanitizeChatMessage = (message: string): string => {
  // Specific sanitization for chat messages
  return sanitizeInput(message)
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 2000) // Enforce length limit
}

// Validation helper functions
export const validateEnhancedQuoteData = (data: unknown) => {
  try {
    return EnhancedQuoteDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Quote validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateEnhancedBidData = (data: unknown) => {
  try {
    return EnhancedBidDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Bid validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateAIEnhancedChatRequest = (data: unknown) => {
  try {
    return AIEnhancedChatRequestSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Chat request validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

export const validateContextualAIAnalysis = (data: unknown) => {
  try {
    return ContextualAIAnalysisSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Contextual AI request validation failed: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`)
    }
    throw error
  }
}

// Content moderation helper
export const moderateMessageContent = (content: string): { isAppropriate: boolean; reason?: string } => {
  const sanitized = sanitizeChatMessage(content)
  
  // Check for inappropriate content
  const inappropriatePatterns = [
    /spam/gi,
    /scam/gi,
    /fake/gi,
    /illegal/gi,
    /hack/gi,
    /cheat/gi,
  ]
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(sanitized)) {
      return {
        isAppropriate: false,
        reason: `Content contains inappropriate language: ${pattern.source}`
      }
    }
  }
  
  // Check message length
  if (sanitized.length > 2000) {
    return {
      isAppropriate: false,
      reason: 'Message exceeds maximum length'
    }
  }
  
  return { isAppropriate: true }
}

// Export all enhanced schemas
export type EnhancedMessageType = z.infer<typeof EnhancedMessageTypeSchema>
export type UserActivityTracking = z.infer<typeof UserActivityTrackingSchema>
export type EnhancedQuoteData = z.infer<typeof EnhancedQuoteDataSchema>
export type EnhancedInstallerData = z.infer<typeof EnhancedInstallerDataSchema>
export type EnhancedBidData = z.infer<typeof EnhancedBidDataSchema>
export type EnhancedChatContext = z.infer<typeof EnhancedChatContextSchema>
export type AIEnhancedChatMessage = z.infer<typeof AIEnhancedChatMessageSchema>
export type AIEnhancedChatRequest = z.infer<typeof AIEnhancedChatRequestSchema>
export type AIEnhancedChatResponse = z.infer<typeof AIEnhancedChatResponseSchema>
export type ContextualAIAnalysis = z.infer<typeof ContextualAIAnalysisSchema>
