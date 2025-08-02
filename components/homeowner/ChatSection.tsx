import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, X, Star, Calendar, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ChatWithInstaller from '@/components/homeowner/ChatWithInstaller';

interface ChatThread {
  id: string;
  quote_id: string;
  installer_id: string;
  installer_name: string;
  quote_type: 'call_visit' | 'written';
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const ChatSection: React.FC = () => {
  const { user } = useAuth();
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);

  useEffect(() => {
    if (user) {
      fetchChatThreads();
    }
  }, [user]);

  const fetchChatThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch written quotes where interested = true
      const { data: writtenQuotesData, error: writtenQuotesError } = await supabase
        .from('written_quotes')
        .select(`
          id,
          installer_id,
          interested,
          status
        `)
        .eq('homeowner_id', user?.id)
        .eq('interested', true);

      if (writtenQuotesError) throw writtenQuotesError;

      // Fetch call/visit quotes where contact_revealed = true
      const { data: callVisitQuotesData, error: callVisitQuotesError } = await supabase
        .from('solar_quotes')
        .select(`
          id,
          contact_revealed,
          type
        `)
        .eq('user_id', user?.id)
        .eq('type', 'call_visit')
        .eq('contact_revealed', true);

      if (callVisitQuotesError) throw callVisitQuotesError;

      // Combine quote IDs
      const quoteIds = [
        ...writtenQuotesData.map(q => q.id),
        ...callVisitQuotesData.map(q => q.id)
      ];

      if (quoteIds.length === 0) {
        setChatThreads([]);
        setLoading(false);
        return;
      }

      // Fetch installers
      const { data: installersData, error: installersError } = await supabase
        .from('installer_companies')
        .select('id, company_name');

      if (installersError) throw installersError;

      // Fetch last message for each quote
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('quote_id, message_text, created_at')
        .in('quote_id', quoteIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by quote_id and get the latest
      const latestMessagesByQuote: Record<string, { text: string, time: string }> = {};
      messagesData.forEach(msg => {
        if (!latestMessagesByQuote[msg.quote_id]) {
          latestMessagesByQuote[msg.quote_id] = {
            text: msg.message_text,
            time: msg.created_at
          };
        }
      });

      // Create chat threads
      const threads: ChatThread[] = [];

      // Add written quotes
      writtenQuotesData.forEach(quote => {
        const installer = installersData.find(i => i.id === quote.installer_id);
        if (installer) {
          threads.push({
            id: `written-${quote.id}`,
            quote_id: quote.id,
            installer_id: installer.id,
            installer_name: installer.company_name,
            quote_type: 'written',
            last_message: latestMessagesByQuote[quote.id]?.text || 'No messages yet',
            last_message_time: latestMessagesByQuote[quote.id]?.time || new Date().toISOString(),
            unread_count: Math.floor(Math.random() * 3) // Mock unread count
          });
        }
      });

      // Add call/visit quotes
      callVisitQuotesData.forEach(quote => {
        // For demo, randomly assign an installer
        const randomInstaller = installersData[Math.floor(Math.random() * installersData.length)];
        if (randomInstaller) {
          threads.push({
            id: `call_visit-${quote.id}`,
            quote_id: quote.id,
            installer_id: randomInstaller.id,
            installer_name: randomInstaller.company_name,
            quote_type: 'call_visit',
            last_message: latestMessagesByQuote[quote.id]?.text || 'No messages yet',
            last_message_time: latestMessagesByQuote[quote.id]?.time || new Date().toISOString(),
            unread_count: Math.floor(Math.random() * 3) // Mock unread count
          });
        }
      });

      // Sort by last message time (most recent first)
      threads.sort((a, b) => {
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
      });

      setChatThreads(threads);
    } catch (err) {
      console.error('Error fetching chat threads:', err);
      setError('Failed to load chat threads. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = (thread: ChatThread) => {
    setSelectedThread(thread);
  };

  const handleCloseChat = () => {
    setSelectedThread(null);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredThreads = chatThreads.filter(thread => 
    thread.installer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Chat</h2>
        <p className="text-battleship_gray-700">Communicate with installers about your quotes</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <X className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Chat Interface */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-onyx-600/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
                  <input
                    type="text"
                    placeholder="Search installers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              
              {/* Chat Threads */}
              <div className="h-[500px] overflow-y-auto">
                {filteredThreads.length > 0 ? (
                  <div className="divide-y divide-onyx-600/30">
                    {filteredThreads.map((thread) => (
                      <div 
                        key={thread.id}
                        onClick={() => handleSelectThread(thread)}
                        className={`p-4 hover:bg-onyx-600/30 cursor-pointer transition-colors ${
                          selectedThread?.id === thread.id ? 'bg-onyx-600/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              thread.unread_count > 0 ? 'bg-giants_orange-500' : 'bg-battleship_gray-600'
                            }`}></div>
                            <h4 className="text-white font-semibold">{thread.installer_name}</h4>
                          </div>
                          <div className="text-xs text-battleship_gray-600">
                            {formatTime(thread.last_message_time)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-battleship_gray-700 text-sm truncate max-w-[200px]">
                            {thread.last_message}
                          </p>
                          <div className={`px-2 py-0.5 rounded-full text-xs ${
                            thread.quote_type === 'call_visit' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {thread.quote_type === 'call_visit' ? 'Call/Visit' : 'Written'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-battleship_gray-600 mb-3" />
                    <p className="text-white font-semibold mb-1">No chat threads found</p>
                    <p className="text-battleship_gray-700 text-sm">
                      {searchTerm 
                        ? 'Try a different search term' 
                        : 'Click "I\'m Interested" on a quote to start chatting'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <ChatWithInstaller
                quoteId={selectedThread.quote_id}
                quoteType={selectedThread.quote_type}
                installerName={selectedThread.installer_name}
                installerCompanyId={selectedThread.installer_id}
                onClose={handleCloseChat}
              />
            ) : (
              <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 h-full flex flex-col items-center justify-center text-center">
                <MessageSquare className="h-16 w-16 text-battleship_gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-battleship_gray-700 mb-6">
                  Choose a chat thread from the left to start messaging with an installer
                </p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'written-quotes' }))}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>View My Quotes</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;