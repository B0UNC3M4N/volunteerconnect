
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/types/opportunity';

interface OpportunityHeaderProps {
  opportunity: Opportunity;
}

const OpportunityHeader: React.FC<OpportunityHeaderProps> = ({ opportunity }) => {
  return (
    <>
      <div className="mb-6">
        <Button asChild variant="ghost" className="pl-0 hover:bg-transparent">
          <Link to="/opportunities" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Opportunities
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{opportunity.title}</h1>
        <div className="flex items-center mt-2">
          <span className="text-gray-700">{opportunity.organization}</span>
          <span className="mx-2">•</span>
          <Badge>{opportunity.category}</Badge>
          {opportunity.urgent && <Badge className="ml-2 bg-red-500">Urgent</Badge>}
        </div>
      </div>
    </>
  );
};

export default OpportunityHeader;
