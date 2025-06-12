
import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { ChatMessage as MessageType } from '@/hooks/useChat';

interface ChatMessageProps {
  message: MessageType;
  isCurrentUser: boolean;
  isNonprofitOwner?: boolean;
  isSystemMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isCurrentUser,
  isNonprofitOwner = false,
  isSystemMessage 
}) => {
  // Format timestamp
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const exactTime = format(new Date(message.created_at), 'MMM d, h:mm a');

  if (isSystemMessage) {
    return (
      <div className="text-center my-4">
        <div className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
          {message.message} • {formattedTime}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isCurrentUser 
        ? 'bg-volunteer-100 text-volunteer-900' 
        : isNonprofitOwner 
          ? 'bg-nonprofit-100 text-nonprofit-900' 
          : 'bg-gray-100 text-gray-700'} rounded-lg px-4 py-2`}>
        {!isCurrentUser && (
          <div className="font-semibold text-xs flex justify-between">
            <span className={isNonprofitOwner ? "text-nonprofit-700" : "text-gray-600"}>
              {message.sender_name || 'Unknown User'} {isNonprofitOwner && "(Organizer)"}
            </span>
          </div>
        )}
        <p className="break-words mt-1">{message.message}</p>
        <div className={`text-xs mt-1 flex justify-between items-center ${
          isCurrentUser ? 'text-volunteer-700' : 
          isNonprofitOwner ? 'text-nonprofit-700' : 'text-gray-500'}`}
        >
          <span title={exactTime}>{formattedTime}</span>
          {isCurrentUser && <span className="text-xs ml-2">You</span>}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
