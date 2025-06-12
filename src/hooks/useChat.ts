
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  is_nonprofit_owner?: boolean;
  is_system_message: boolean;
  is_read?: boolean;
}

export function useChat(opportunityId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!opportunityId || !user) return;
    
    let isMounted = true;
    let chatRoomId: string | null = null;
    let nonprofitOwnerId: string | null = null;
    
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        
        // First get the chat room id for this opportunity
        const { data: roomData, error: roomError } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('opportunity_id', opportunityId)
          .single();
        
        if (roomError) {
          console.error('Error fetching chat room:', roomError);
          if (roomError.code !== 'PGRST116') { // Not found
            throw roomError;
          }
          // If no chat room found, just set empty messages
          setMessages([]);
          setIsLoading(false);
          return;
        }
        
        chatRoomId = roomData.id;
        console.log("Found chat room:", chatRoomId);
        
        // Then fetch messages for this room
        const { data, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*, users:sender_id(email, raw_user_meta_data)')
          .eq('chat_room_id', chatRoomId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        console.log("Raw message data:", data);
        
        // Fetch opportunity creator to mark messages from nonprofit owner
        const { data: opportunityData, error: opportunityError } = await supabase
          .from('opportunities')
          .select('created_by')
          .eq('id', opportunityId)
          .single();
          
        if (opportunityError && opportunityError.code !== 'PGRST116') throw opportunityError;
        
        nonprofitOwnerId = opportunityData?.created_by || null;
        console.log("Nonprofit owner ID:", nonprofitOwnerId);
        
        if (data && isMounted) {
          // Transform messages to include sender name and if sent by nonprofit owner
          const transformedMessages = data.map(msg => {
            console.log("Processing message:", msg);
            const userData = msg.users as any;
            const firstName = userData?.raw_user_meta_data?.first_name || '';
            const lastName = userData?.raw_user_meta_data?.last_name || '';
            const displayName = [firstName, lastName].filter(Boolean).join(' ') || userData?.email || 'Unknown User';
            
            // Calculate unread messages (those created after last visit and not by current user)
            const isUnread = msg.sender_id !== user.id;
            
            return {
              ...msg,
              sender_name: displayName,
              is_nonprofit_owner: msg.sender_id === nonprofitOwnerId,
              is_read: !isUnread
            };
          });
          
          console.log("Transformed messages:", transformedMessages);
          setMessages(transformedMessages);
          
          // Count unread messages 
          const unreadMessages = transformedMessages.filter(msg => 
            msg.sender_id !== user.id && 
            new Date(msg.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Messages in last 24h
          );
          setUnreadCount(unreadMessages.length);
        }
      } catch (err) {
        console.error('Error in fetching messages:', err);
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchMessages();
    
    // Set up realtime subscription
    const setupSubscription = () => {
      if (!chatRoomId) return null;
      
      return supabase
        .channel('public:chat_messages')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        }, payload => {
          console.log('New message received:', payload);
          // Fetch full message details including user data
          const fetchNewMessage = async () => {
            const { data, error } = await supabase
              .from('chat_messages')
              .select('*, users:sender_id(email, raw_user_meta_data)')
              .eq('id', payload.new.id)
              .single();
              
            if (error) {
              console.error('Error fetching new message details:', error);
              return;
            }
            
            const userData = data.users as any;
            const firstName = userData?.raw_user_meta_data?.first_name || '';
            const lastName = userData?.raw_user_meta_data?.last_name || '';
            const displayName = [firstName, lastName].filter(Boolean).join(' ') || userData?.email || 'Unknown User';
            
            const isCurrentUser = data.sender_id === user.id;
            
            const newMessage = {
              ...data,
              sender_name: displayName,
              is_nonprofit_owner: data.sender_id === nonprofitOwnerId,
              is_read: isCurrentUser
            };
            
            console.log("New message processed:", newMessage);
            setMessages(prev => [...prev, newMessage]);
            
            // Show notification for new messages from others
            if (!isCurrentUser && document.visibilityState !== 'visible') {
              toast({
                title: `New message from ${displayName}`,
                description: data.message.length > 50 ? `${data.message.substring(0, 50)}...` : data.message,
                duration: 5000
              });
              
              // Increment unread count
              setUnreadCount(prev => prev + 1);
            }
          };
          
          fetchNewMessage();
        })
        .subscribe();
    };
    
    // Wait for fetchMessages to complete first, then set up subscription
    fetchMessages().then(() => {
      const channel = setupSubscription();
      
      return () => {
        isMounted = false;
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    });
    
    // Handle visibility change (when user returns to the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && unreadCount > 0) {
        // Auto-mark as read when user comes back to the page
        markAsRead();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [opportunityId, user, toast]);
  
  const sendMessage = async (messageText: string) => {
    if (!user || !opportunityId) {
      throw new Error('User not authenticated or opportunity ID not provided');
    }
    
    try {
      setIsSending(true);
      
      // First check if chat room exists
      let { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('opportunity_id', opportunityId)
        .single();
      
      console.log("Checking for existing chat room for opportunity:", opportunityId);
      
      // If no chat room, create one
      if (roomError && roomError.code === 'PGRST116') { // Not found
        console.log("Chat room not found, creating new one");
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({ opportunity_id: opportunityId })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating chat room:", createError);
          throw createError;
        }
        
        console.log("Created new chat room:", newRoom);
        roomData = newRoom;
      } else if (roomError) {
        console.error("Error checking for chat room:", roomError);
        throw roomError;
      }
      
      console.log("Sending message to chat room:", roomData.id);
      
      // Send the message
      const { error: sendError } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: roomData.id,
          sender_id: user.id,
          message: messageText,
          is_system_message: false
        });
        
      if (sendError) {
        console.error("Error sending message:", sendError);
        throw sendError;
      }
      
      console.log("Message sent successfully");
      
      // No need to update local state, the subscription will handle that
      
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setIsSending(false);
    }
  };
  
  // Mark all messages as read
  const markAsRead = () => {
    console.log("Marking all messages as read");
    setUnreadCount(0);
    setMessages(prev => prev.map(msg => ({...msg, is_read: true})));
  };
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isSending,
    unreadCount,
    markAsRead
  };
}
