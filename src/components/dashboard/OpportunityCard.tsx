
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ListCheck, MessageSquare } from 'lucide-react';
import type { Opportunity } from '@/types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
  pendingCount: number;
  assignedCount: number;
}

const OpportunityCard = ({ opportunity, pendingCount, assignedCount }: OpportunityCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{opportunity.title}</CardTitle>
            <CardDescription className="mt-2">{opportunity.organization}</CardDescription>
          </div>
          {opportunity.urgent && (
            <Badge className="bg-red-500">Urgent</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Location:</span>
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span>{opportunity.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Category:</span>
            <span>{opportunity.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Applications:</span>
            <div className="flex space-x-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {pendingCount} Pending
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {assignedCount} Assigned
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex flex-col gap-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={() => navigate(`/opportunity/${opportunity.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={() => navigate(`/manage-applications/${opportunity.id}`)}>
            <ListCheck className="mr-2 h-4 w-4" />
            Manage Applications
          </Button>
        </div>
        
        {assignedCount > 0 && (
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={() => navigate(`/manage-applications/${opportunity.id}?tab=chat`)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Group Chat
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard;
