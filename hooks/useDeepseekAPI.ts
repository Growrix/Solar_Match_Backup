import { useState } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const DEEPSEEK_API_KEY = 'sk-dc7a57ea9f5548c89c801208e4dbc112';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const useDeepseekAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string, chatHistory: Message[] = []): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation context
      const messages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant for SolarMatch Australia, a platform that helps Australians find solar installers and calculate rebates. You should:

1. Be knowledgeable about Australian solar energy, rebates, and installation processes
2. Help users with solar-related questions, quotes, and rebate calculations
3. Be friendly, professional, and concise
4. If asked about non-solar topics, politely redirect to solar-related assistance
5. Provide accurate information about Australian solar rebates, STCs, and state-specific programs
6. Help users understand the solar installation process and what to expect

Current context: You're integrated into the SolarMatch website where users can calculate rebates and get quotes.`
        },
        // Include recent chat history for context (last 10 messages)
        ...chatHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          throw new Error('API authentication failed. Please check your API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Deepseek service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content;

    } catch (err) {
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Return a helpful fallback message instead of throwing
      return `I'm having trouble connecting right now. Here are some things I can help you with:

• Calculate solar rebates for your location
• Estimate system size for your home
• Explain the solar installation process
• Compare different solar panel options
• Understand government incentives

Please try asking your question again, or use the quote calculator on this page to get started with your solar journey!`;

    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error
  };
};