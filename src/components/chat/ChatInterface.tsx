
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  opportunityId: string;
  opportunityTitle: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ opportunityId, opportunityTitle }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isNonprofit } = useAuth();
  const { toast } = useToast();
  const { 
    messages, 
    isLoading, 
    sendMessage,
    isSending,
    unreadCount,
    markAsRead
  } = useChat(opportunityId);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read when chat is opened
    if (messages.length > 0 && unreadCount > 0) {
      markAsRead();
    }

    console.log("Messages in ChatInterface:", messages);
  }, [messages, unreadCount, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    try {
      console.log("Sending message:", message);
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Your message could not be sent. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <div className="text-center py-8 text-gray-600">Please log in to use the chat.</div>;
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-md overflow-hidden">
      {/* Chat header */}
      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <h3 className="font-medium">Group Chat: {opportunityTitle}</h3>
        {unreadCount > 0 && (
          <span className="bg-volunteer-500 text-white text-xs rounded-full px-2 py-1">
            {unreadCount} new
          </span>
        )}
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 ml-auto" />
                <Skeleton className="h-16 w-64" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            console.log("Rendering message:", msg);
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                isCurrentUser={msg.sender_id === user.id}
                isNonprofitOwner={isNonprofit() && msg.is_nonprofit_owner}
                isSystemMessage={msg.is_system_message}
              />
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet.</p>
            <p className="text-sm">Be the first to send a message!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            rows={2}
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isSending || !message.trim()}
            className="self-end bg-volunteer-500 hover:bg-volunteer-600 text-white"
          >
            <Send size={18} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <div className="text-xs text-right mt-1 text-gray-500">
          {message.length}/500
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
