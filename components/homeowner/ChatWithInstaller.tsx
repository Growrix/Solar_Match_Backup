import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Paperclip, 
  X, 
  Info,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  quote_id: string;
  sender_type: 'homeowner' | 'installer';
  sender_id: string;
  message_text: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
}

interface ChatProps {
  quoteId: string;
  quoteType: 'call_visit' | 'written';
  installerName: string;
  installerCompanyId: string;
  onClose?: () => void;
  isEmbedded?: boolean;
}

const ChatWithInstaller: React.FC<ChatProps> = ({ 
  quoteId, 
  quoteType, 
  installerName, 
  installerCompanyId,
  onClose,
  isEmbedded = false
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactWarning, setShowContactWarning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Regex patterns for detecting contact information
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phonePattern = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  useEffect(() => {
    if (user && quoteId) {
      fetchMessages();
      subscribeToNewMessages();
    }
  }, [user, quoteId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load chat messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewMessages = () => {
    const subscription = supabase
      .channel(`chat:${quoteId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `quote_id=eq.${quoteId}`
      }, (payload) => {
        // Add the new message to our state
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    // Check for contact information in No Call/Visit quotes
    if (quoteType !== 'call_visit' && containsContactInfo(newMessage)) {
      setShowContactWarning(true);
      return;
    }

    try {
      const message = {
        quote_id: quoteId,
        sender_type: 'homeowner' as const,
        sender_id: user.id,
        message_text: newMessage.trim()
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(message);

      if (error) throw error;

      // Clear the input field
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const containsContactInfo = (text: string): boolean => {
    return emailPattern.test(text) || phonePattern.test(text) || urlPattern.test(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Only allow file uploads for call_visit quotes
    if (quoteType !== 'call_visit') {
      setUploadError('File uploads are only allowed for Call/Visit quotes');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only images (JPEG, PNG, GIF) and PDF files are allowed');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `chat_attachments/${quoteId}/${fileName}`;

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
        quote_id: quoteId,
        sender_type: 'homeowner' as const,
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
    } catch (err) {
      console.error('Error uploading file:', err);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
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
    if (!attachmentType) return <File className="h-5 w-5" />;
    
    if (attachmentType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (attachmentType === 'application/pdf') {
      return <FileText className="h-5 w-5" />;
    }
    
    return <File className="h-5 w-5" />;
  };

  return (
    <div className={`${isEmbedded ? '' : 'p-8'}`}>
      {!isEmbedded && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Chat with {installerName}</h2>
          <p className="text-battleship_gray-700">Communicate directly about your solar quote</p>
        </div>
      )}

      <div className={`bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden ${isEmbedded ? '' : ''}`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-onyx-600/30 bg-onyx-600/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-giants_orange-500/20 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-giants_orange-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{installerName}</h3>
                <p className="text-xs text-battleship_gray-600">
                  {quoteType === 'call_visit' ? 'Call/Visit Quote Chat' : 'Written Quote Chat'}
                </p>
              </div>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="text-battleship_gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-onyx-500/30"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Type Warning Banner */}
        {quoteType !== 'call_visit' && (
          <div className="bg-blue-500/10 border-y border-blue-500/30 p-3">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <p className="text-blue-300 text-sm">
                This is a Written Quote chat. For privacy, please don't share contact information or attachments.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 m-4 rounded-xl p-3 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="bg-red-500/10 border border-red-500/30 m-4 rounded-xl p-3 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{uploadError}</p>
            <button 
              onClick={() => setUploadError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-8 h-8 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-battleship_gray-600 mb-3" />
              <p className="text-white font-semibold mb-1">No messages yet</p>
              <p className="text-battleship_gray-700 text-sm">
                Start the conversation with {installerName}
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
                  <div className={`flex ${message.sender_type === 'homeowner' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender_type === 'homeowner' 
                        ? 'bg-giants_orange-500/20 text-white' 
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
                        message.sender_type === 'homeowner' ? 'text-giants_orange-300' : 'text-battleship_gray-600'
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
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-onyx-600/30">
          <div className="flex items-end space-x-2">
            {/* File Upload Button (only for call/visit quotes) */}
            {quoteType === 'call_visit' && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-battleship_gray-600 hover:text-giants_orange-500 hover:bg-onyx-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
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
                placeholder={`Type your message to ${installerName}...`}
                className="w-full px-4 py-3 bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl text-white placeholder-battleship_gray-600 focus:outline-none focus:border-giants_orange-500 resize-none max-h-32"
                rows={1}
              />
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white rounded-xl hover:from-giants_orange-600 hover:to-giants_orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {/* Chat Type Indicator */}
          <div className="mt-2 flex items-center">
            {quoteType === 'call_visit' ? (
              <div className="flex items-center text-xs text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Full chat mode - attachments and contact info allowed</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-yellow-400">
                <Clock className="h-3 w-3 mr-1" />
                <span>Limited chat mode - no attachments or contact info</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info Warning Modal */}
      {showContactWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowContactWarning(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Contact Information Detected</h3>
              <p className="text-battleship_gray-700">
                For your privacy and security, please don't share contact information in written quote chats.
              </p>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">
                Your message appears to contain email addresses, phone numbers, or website links. 
                This information will be visible to the installer.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowContactWarning(false)}
                className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Edit Message
              </button>
              <button
                onClick={() => {
                  handleSendMessage();
                  setShowContactWarning(false);
                }}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all"
              >
                Send Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithInstaller;