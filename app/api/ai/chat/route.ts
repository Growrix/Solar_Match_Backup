import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Input validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.object({
    quoteId: z.string().optional(),
    systemSize: z.number().optional(),
    propertyType: z.string().optional(),
  }).optional(),
})

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Rate limiting check
    const userKey = user.id
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 10 // 10 requests per minute

    const userLimit = rateLimitMap.get(userKey)
    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= maxRequests) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Try again later.' },
            { status: 429 }
          )
        }
        userLimit.count++
      } else {
        rateLimitMap.set(userKey, { count: 1, resetTime: now + windowMs })
      }
    } else {
      rateLimitMap.set(userKey, { count: 1, resetTime: now + windowMs })
    }

    // 3. Input validation
    const body = await request.json()
    const validatedData = chatRequestSchema.parse(body)

    // 4. Prepare AI request
    const aiRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful solar energy assistant for Australian customers. Provide accurate information about solar panels, installation, rebates, and energy savings.'
        },
        {
          role: 'user',
          content: validatedData.message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }

    // 5. Call OpenAI API
    const aiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(aiRequest),
    })

    if (!aiResponse.ok) {
      throw new Error(`OpenAI API error: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()

    // 6. Log the interaction (optional - depends on database schema)
    try {
      await supabase.from('ai_interactions').insert({
        user_id: user.id,
        message: validatedData.message,
        response: aiData.choices[0].message.content,
        context: validatedData.context,
        created_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.warn('Failed to log AI interaction:', logError)
      // Don't fail the request if logging fails
    }

    // 7. Return response
    return NextResponse.json({
      message: aiData.choices[0].message.content,
      usage: aiData.usage,
    })

  } catch (error) {
    console.error('AI chat error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
