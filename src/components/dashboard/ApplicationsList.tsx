
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Application, Opportunity } from '@/types/opportunity';

interface ApplicationsListProps {
  applications: Application[];
  opportunities?: Opportunity[];
  formatDate: (dateString: string | null) => string;
}

const ApplicationsList = ({ applications, opportunities, formatDate }: ApplicationsListProps) => {
  const navigate = useNavigate();

  const getOpportunityTitle = (opportunityId: string) => {
    const opportunity = opportunities?.find(opp => opp.id === opportunityId);
    return opportunity?.title || 'Unknown Opportunity';
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Assigned</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVolunteerName = (application: Application) => {
    if (application.profiles) {
      const firstName = application.profiles.first_name || '';
      const lastName = application.profiles.last_name || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      return application.profiles.email || 'Unknown';
    }
    return 'Unknown Volunteer';
  };

  const renderRatingStars = (application: Application) => {
    const rating = application.volunteer_reviews?.[0]?.rating;
    
    if (!rating) return <span className="text-gray-400">Not rated</span>;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-6 bg-gray-50 p-4 font-medium border-b">
          <div>Opportunity</div>
          <div>Volunteer</div>
          <div>Date Applied</div>
          <div>Status</div>
          <div>Rating</div>
          <div>Actions</div>
        </div>
        {applications.length > 0 ? (
          applications.map(application => (
            <div key={application.id} className="grid grid-cols-6 p-4 border-b items-center">
              <div className="font-medium">{getOpportunityTitle(application.opportunity_id)}</div>
              <div>{getVolunteerName(application)}</div>
              <div>{formatDate(application.created_at)}</div>
              <div>
                {getStatusBadge(application.status)}
              </div>
              <div>
                {application.status === 'accepted' && renderRatingStars(application)}
              </div>
              <div>
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/manage-applications/${application.opportunity_id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No applications found</div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;
