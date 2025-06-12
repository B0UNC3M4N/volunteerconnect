
import React from 'react';
import ChatInterface from './chat/ChatInterface';

interface OpportunityChatTabProps {
  opportunityId: string;
  opportunityTitle: string;
}

const OpportunityChatTab: React.FC<OpportunityChatTabProps> = ({ 
  opportunityId,
  opportunityTitle
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-2">Group Chat</h3>
        <p className="text-gray-500">
          This is the group chat for all assigned volunteers and the nonprofit organization. 
          Messages are visible to all participants. Chat history is preserved.
        </p>
      </div>
      
      <ChatInterface opportunityId={opportunityId} opportunityTitle={opportunityTitle} />
    </div>
  );
};

export default OpportunityChatTab;
