import { NextRequest, NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

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

    // Get the message from the request
    const body = await request.json()
    const message = body.message || 'Hello'

    console.log('Received message:', message)

    // Simple AI request
    const aiRequest = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for solar energy advice. Provide brief, helpful responses.'
        },
        {
          role: 'user', 
          content: message
        }
      ],
      max_tokens: 500,
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
        error: 'OpenAI API error',
        details: `Status: ${aiResponse.status}, Error: ${JSON.stringify(errorData)}`
      }, { status: 500 })
    }

    const aiData = await aiResponse.json()
    console.log('OpenAI response received:', !!aiData.choices?.[0]?.message?.content)

    const responseMessage = aiData.choices[0].message.content

    return NextResponse.json({
      message: responseMessage,
      messageType: 'general',
      confidence: 0.9
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'AI Chat API is running', timestamp: new Date().toISOString() })
}
