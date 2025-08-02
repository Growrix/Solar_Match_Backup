import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Search, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Paperclip, 
  User,
  Calendar
} from 'lucide-react';
import { useInstallerAuth } from '@/hooks/useInstallerAuth';
import { supabase } from '@/lib/supabase';

interface ChatThread {
  id: string;
  quote_id: string;
  homeowner_id: string;
  homeowner_name: string;
  quote_type: 'call_visit' | 'written';
  system_type: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface ChatMessage {
  id: string;
  quote_id: string;
  sender_type: 'homeowner' | 'installer';
  sender_id: string;
  sender_name: string;
  message_text: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
}

const ChatSection: React.FC = () => {
  const { user, installerData } = useInstallerAuth();
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && installerData?.company_id) {
      fetchChatThreads();
    }
  }, [user, installerData?.company_id]);

  useEffect(() => {
    if (selectedThread) {
      fetchMessages(selectedThread.quote_id);
      
      // Subscribe to new messages for this thread
      const subscription = supabase
        .channel(`chat:${selectedThread.quote_id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `quote_id=eq.${selectedThread.quote_id}`
        }, (payload) => {
          // Add the new message to our state
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch written quotes where homeowner is interested
      const { data: quotesData, error: quotesError } = await supabase
        .from('written_quotes')
        .select(`
          id,
          homeowner_id,
          system_type,
          status,
          interested
        `)
        .eq('installer_id', installerData.company_id)
        .eq('interested', true);

      if (quotesError) throw quotesError;

      // Fetch homeowner profiles
      const homeownerIds = quotesData?.map(q => q.homeowner_id) || [];
      
      if (homeownerIds.length === 0) {
        setChatThreads([]);
        setLoading(false);
        return;
      }
      
      const { data: homeownersData, error: homeownersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', homeownerIds);

      if (homeownersError) throw homeownersError;

      // Fetch last message for each quote
      const quoteIds = quotesData?.map(q => q.id) || [];
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('quote_id, message_text, created_at')
        .in('quote_id', quoteIds)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by quote_id and get the latest
      const latestMessagesByQuote: Record<string, { text: string, time: string }> = {};
      messagesData?.forEach(msg => {
        if (!latestMessagesByQuote[msg.quote_id]) {
          latestMessagesByQuote[msg.quote_id] = {
            text: msg.message_text,
            time: msg.created_at
          };
        }
      });

      // Create chat threads
      const threads: ChatThread[] = [];

      quotesData?.forEach(quote => {
        const homeowner = homeownersData?.find(h => h.id === quote.homeowner_id);
        if (homeowner) {
          threads.push({
            id: `written-${quote.id}`,
            quote_id: quote.id,
            homeowner_id: homeowner.id,
            homeowner_name: homeowner.full_name,
            quote_type: 'written',
            system_type: quote.system_type,
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

  const fetchMessages = async (quoteId: string) => {
    try {
      setLoadingMessages(true);
      setMessageError(null);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessageError('Failed to load chat messages. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || !user || !installerData?.company_id) return;

    try {
      setSendingMessage(true);
      setMessageError(null);
      
      const message = {
        quote_id: selectedThread.quote_id,
        sender_type: 'installer' as const,
        sender_id: user.id,
        message_text: newMessage.trim()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(message);

      if (error) throw error;

      // Clear the input field
      setNewMessage('');
      
      // Update the thread's last message
      setChatThreads(prev => prev.map(thread => 
        thread.quote_id === selectedThread.quote_id 
          ? { 
              ...thread, 
              last_message: newMessage.trim(),
              last_message_time: new Date().toISOString(),
              unread_count: 0
            } 
          : thread
      ));
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedThread || !user || !installerData?.company_id) return;

    // Only allow file uploads for call_visit quotes
    if (selectedThread.quote_type !== 'call_visit') {
      setMessageError('File uploads are only allowed for Call/Visit quotes');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessageError('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setMessageError('Only images (JPEG, PNG, GIF) and PDF files are allowed');
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError(null);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `chat_attachments/${selectedThread.quote_id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('chat_attachments')
        .getPublicUrl(filePath);

      // Send message with attachment
      const message = {
        quote_id: selectedThread.quote_id,
        sender_type: 'installer' as const,
        sender_id: user.id,
        message_text: `Sent an attachment: ${file.name}`,
        attachment_url: urlData.publicUrl,
        attachment_type: file.type
      };

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert(message);

      if (messageError) throw messageError;

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Update the thread's last message
      setChatThreads(prev => prev.map(thread => 
        thread.quote_id === selectedThread.quote_id 
          ? { 
              ...thread, 
              last_message: `Sent an attachment: ${file.name}`,
              last_message_time: new Date().toISOString(),
              unread_count: 0
            } 
          : thread
      ));
    } catch (err) {
      console.error('Error uploading file:', err);
      setMessageError('Failed to upload file. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const shouldShowDate = (index: number, message: ChatMessage) => {
    if (index === 0) return true;
    
    const prevDate = new Date(messages[index - 1].created_at).toDateString();
    const currDate = new Date(message.created_at).toDateString();
    
    return prevDate !== currDate;
  };

  const getAttachmentIcon = (attachmentType: string | undefined) => {
    if (!attachmentType) return <Paperclip className="h-5 w-5" />;
    
    if (attachmentType.startsWith('image/')) {
      return <img src="/image-icon.svg" alt="Image" className="h-5 w-5" />;
    } else if (attachmentType === 'application/pdf') {
      return <img src="/pdf-icon.svg" alt="PDF" className="h-5 w-5" />;
    }
    
    return <Paperclip className="h-5 w-5" />;
  };

  const filteredThreads = chatThreads.filter(thread => 
    thread.homeowner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.system_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Chat</h2>
        <p className="text-battleship_gray-700">Communicate with homeowners about their quotes</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
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
                    placeholder="Search homeowners..."
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
                        onClick={() => setSelectedThread(thread)}
                        className={`p-4 hover:bg-onyx-600/30 cursor-pointer transition-colors ${
                          selectedThread?.id === thread.id ? 'bg-onyx-600/50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              thread.unread_count > 0 ? 'bg-giants_orange-500' : 'bg-battleship_gray-600'
                            }`}></div>
                            <h4 className="text-white font-semibold">{thread.homeowner_name}</h4>
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
                    <MessageCircle className="h-12 w-12 text-battleship_gray-600 mb-3" />
                    <p className="text-white font-semibold mb-1">No chat threads found</p>
                    <p className="text-battleship_gray-700 text-sm">
                      {searchTerm 
                        ? 'Try a different search term' 
                        : 'Homeowners will appear here when they express interest in your quotes'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedThread ? (
              <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-onyx-600/30 bg-onyx-600/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-giants_orange-500/20 p-2 rounded-lg">
                        <User className="h-5 w-5 text-giants_orange-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{selectedThread.homeowner_name}</h3>
                        <p className="text-xs text-battleship_gray-600">
                          {selectedThread.system_type}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      selectedThread.quote_type === 'call_visit' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedThread.quote_type === 'call_visit' ? 'Call/Visit' : 'Written'}
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="w-8 h-8 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-12 w-12 text-battleship_gray-600 mb-3" />
                      <p className="text-white font-semibold mb-1">No messages yet</p>
                      <p className="text-battleship_gray-700 text-sm">
                        Start the conversation with {selectedThread.homeowner_name}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <React.Fragment key={message.id}>
                          {/* Date Separator */}
                          {shouldShowDate(index, message) && (
                            <div className="flex justify-center my-4">
                              <div className="bg-onyx-600/30 text-battleship_gray-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(message.created_at)}
                              </div>
                            </div>
                          )}
                          
                          {/* Message Bubble */}
                          <div className={`flex ${message.sender_type === 'installer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              message.sender_type === 'installer' 
                                ? 'bg-blue-500/20 text-white' 
                                : 'bg-onyx-600/50 text-white'
                            }`}>
                              {/* Attachment (if any) */}
                              {message.attachment_url && (
                                <a 
                                  href={message.attachment_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block mb-2 p-3 bg-onyx-600/30 rounded-lg hover:bg-onyx-600/50 transition-colors"
                                >
                                  <div className="flex items-center space-x-2">
                                    {getAttachmentIcon(message.attachment_type)}
                                    <span className="text-sm truncate">
                                      {message.message_text.replace('Sent an attachment: ', '')}
                                    </span>
                                  </div>
                                </a>
                              )}
                              
                              {/* Message Text (if not just an attachment) */}
                              {(!message.attachment_url || !message.message_text.startsWith('Sent an attachment:')) && (
                                <p className="whitespace-pre-wrap break-words">{message.message_text}</p>
                              )}
                              
                              {/* Timestamp */}
                              <div className={`text-xs mt-1 ${
                                message.sender_type === 'installer' ? 'text-blue-300' : 'text-battleship_gray-600'
                              }`}>
                                {formatTime(message.created_at)}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                  
                  {/* Message Error */}
                  {messageError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
                      <p className="text-red-400 text-sm">{messageError}</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-onyx-600/30">
                  <div className="flex items-end space-x-2">
                    {/* File Upload Button (only for call/visit quotes) */}
                    {selectedThread.quote_type === 'call_visit' && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={sendingMessage}
                          className="p-2 text-battleship_gray-600 hover:text-giants_orange-500 hover:bg-onyx-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingMessage ? (
                            <div className="w-5 h-5 border-2 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Paperclip className="h-5 w-5" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/jpeg,image/png,image/gif,application/pdf"
                        />
                      </>
                    )}
                    
                    {/* Message Input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Type your message to ${selectedThread.homeowner_name}...`}
                        className="w-full px-4 py-3 bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl text-white placeholder-battleship_gray-600 focus:outline-none focus:border-giants_orange-500 resize-none max-h-32"
                        rows={1}
                      />
                    </div>
                    
                    {/* Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="p-3 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white rounded-xl hover:from-giants_orange-600 hover:to-giants_orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Chat Type Indicator */}
                  <div className="mt-2 flex items-center">
                    {selectedThread.quote_type === 'call_visit' ? (
                      <div className="flex items-center text-xs text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Full chat mode - attachments and contact info allowed</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-yellow-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        <span>Limited chat mode - no attachments or contact info</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 h-full flex flex-col items-center justify-center text-center">
                <MessageCircle className="h-16 w-16 text-battleship_gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                <p className="text-battleship_gray-700 mb-6">
                  Choose a chat thread from the left to start messaging with a homeowner
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;