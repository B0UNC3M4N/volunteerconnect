
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Opportunity, Application } from '@/types/opportunity';
import OpportunityCard from './OpportunityCard';

interface OpportunitiesListProps {
  opportunities: Opportunity[];
  applications?: Application[];
  onPostNew: () => void;
}

const OpportunitiesList = ({ opportunities, applications, onPostNew }: OpportunitiesListProps) => {
  const navigate = useNavigate();

  const getApplicationsForOpportunity = (opportunityId: string) => {
    if (!applications) return [];
    return applications.filter(app => app.opportunity_id === opportunityId);
  };

  const getPendingCountForOpportunity = (opportunityId: string) => {
    const opportunityApps = getApplicationsForOpportunity(opportunityId);
    return opportunityApps.filter(app => app.status === 'pending').length;
  };

  const getAssignedCountForOpportunity = (opportunityId: string) => {
    const opportunityApps = getApplicationsForOpportunity(opportunityId);
    return opportunityApps.filter(app => app.status === 'accepted').length;
  };

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-medium mb-2">No opportunities posted yet</h3>
        <p className="text-gray-600 mb-4">Create your first volunteer opportunity to start receiving applications.</p>
        <Button onClick={onPostNew}>
          Post New Opportunity
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map(opportunity => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          pendingCount={getPendingCountForOpportunity(opportunity.id)}
          assignedCount={getAssignedCountForOpportunity(opportunity.id)}
        />
      ))}
    </div>
  );
};

export default OpportunitiesList;
