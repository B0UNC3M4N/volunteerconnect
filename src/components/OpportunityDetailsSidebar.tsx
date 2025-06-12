
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/types/opportunity';
import type { ApplicationData } from '@/components/ApplicationsTable';

interface OpportunityDetailsSidebarProps {
  opportunity: Opportunity;
  applications?: ApplicationData[];
  assignedCount: number;
}

const OpportunityDetailsSidebar: React.FC<OpportunityDetailsSidebarProps> = ({ 
  opportunity, 
  applications,
  assignedCount 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p>{opportunity.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Date</h3>
            <p>{opportunity.date}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p>{opportunity.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Volunteer Status</h3>
            <div className="mt-1">
              <Badge className="bg-green-100 text-green-800">
                {assignedCount} Assigned
              </Badge>
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                {applications?.filter(app => app.status === 'pending').length || 0} Pending
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="whitespace-pre-wrap">{opportunity.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityDetailsSidebar;
