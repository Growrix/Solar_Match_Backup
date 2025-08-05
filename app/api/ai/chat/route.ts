import { NextRequest, NextResponse } from 'next/server'

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Debug log to check API key
console.log('OPENAI_API_KEY available:', !!OPENAI_API_KEY)
console.log('OPENAI_API_KEY format valid:', OPENAI_API_KEY?.startsWith('sk-') ? 'Yes' : 'No')

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('OpenAI API key is not configured properly')
      return NextResponse.json({
        error: 'AI service is not configured. Please contact the administrator.',
        details: 'OpenAI API key missing'
      }, { status: 503 })
    }

    console.log('AI Chat API called')

    // Get the message from the request
    const body = await request.json()
    const message = body.message || 'Hello'

    console.log('Received message:', message)

    // Simple rate limiting based on IP
    const clientIP = request.headers.get('x-forwarded-for') || 'localhost'
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 10

    const ipLimit = rateLimitMap.get(clientIP)
    if (ipLimit) {
      if (now < ipLimit.resetTime) {
        if (ipLimit.count >= maxRequests) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Try again later.' },
            { status: 429 }
          )
        }
        ipLimit.count++
      } else {
        rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs })
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs })
    }

    // Build AI system prompt
    const systemPrompt = `You are SolarBot, an advanced AI assistant for SolarMatch Australia. You specialize in solar energy advice, quote analysis, and installation guidance.

RESPONSE GUIDELINES:
1. Be conversational, helpful, and Australia-focused
2. Provide specific, actionable advice about solar energy
3. Include relevant calculations when discussing costs or savings
4. Reference current Australian rebates and incentives
5. Suggest next steps and offer to help with specific tasks

Keep responses concise but informative.`

    // Enhanced AI request
    const aiRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user', 
          content: message
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }

    console.log('Sending request to OpenAI...')

    // Call OpenAI API
    const aiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(aiRequest),
    })

    console.log('OpenAI response status:', aiResponse.status)

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('OpenAI API error:', aiResponse.status, errorData);
      return NextResponse.json({
        error: 'Sorry, I encountered an error. Please try again.',
        details: 'AI service temporarily unavailable'
      }, { status: 503 })
    }

    const aiData = await aiResponse.json()
    console.log('OpenAI response received:', !!aiData.choices?.[0]?.message?.content)

    if (!aiData.choices?.[0]?.message?.content) {
      console.error('No response content from OpenAI')
      return NextResponse.json({
        error: 'No response from AI service',
        details: 'Empty response received'
      }, { status: 500 })
    }

    const responseMessage = aiData.choices[0].message.content

    // Return enhanced response
    return NextResponse.json({
      message: responseMessage,
      messageType: 'general',
      confidence: 0.9
    })

  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
