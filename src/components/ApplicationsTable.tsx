
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  email: string;
  raw_user_meta_data: {
    role?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface ApplicationData {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: string;
  message: string | null;
  created_at: string;
  updated_at: string;
  users: UserData;
  profiles?: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  volunteer_rating?: number | null;
}

interface ApplicationsTableProps {
  applications: ApplicationData[];
  selectedIds: string[];
  onSelectApplication: (applicationId: string, isSelected: boolean) => void;
}

const ApplicationsTable = ({ 
  applications, 
  selectedIds,
  onSelectApplication,
}: ApplicationsTableProps) => {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckboxChange = (applicationId: string, checked: boolean) => {
    onSelectApplication(applicationId, checked);
  };

  const handleViewMessage = (message: string) => {
    setCurrentMessage(message);
    setMessageDialogOpen(true);
  };

  const handleRateVolunteer = (applicationId: string, currentRating: number | null) => {
    setCurrentApplicationId(applicationId);
    setCurrentRating(currentRating || 0);
    setRatingDialogOpen(true);
  };

  const submitRating = async () => {
    if (!currentApplicationId) return;
    
    try {
      // First check if rating already exists
      const { data: existingRating } = await supabase
        .from('volunteer_reviews')
        .select('id')
        .eq('application_id', currentApplicationId)
        .single();

      let result;
      
      if (existingRating) {
        // Update existing rating
        result = await supabase
          .from('volunteer_reviews')
          .update({ rating: currentRating })
          .eq('application_id', currentApplicationId);
      } else {
        // Create new rating
        result = await supabase
          .from('volunteer_reviews')
          .insert({ 
            application_id: currentApplicationId, 
            rating: currentRating 
          });
      }

      if (result.error) throw result.error;
      
      toast({
        title: "Rating submitted",
        description: "The volunteer has been rated successfully.",
      });
      
      setRatingDialogOpen(false);
      
      // Refresh the page to show updated ratings
      window.location.reload();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit rating. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const renderRatingStars = (rating: number | null) => {
    if (!rating) return "Not rated";
    
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>Volunteer</TableHead>
            <TableHead>Application Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => {
            // Extract name from user metadata or profiles
            const firstName = application.users?.raw_user_meta_data?.first_name || application.profiles?.first_name || '';
            const lastName = application.users?.raw_user_meta_data?.last_name || application.profiles?.last_name || '';
            const name = [firstName, lastName].filter(Boolean).join(' ') || application.users?.email || application.profiles?.email || 'Unknown User';

            return (
              <TableRow key={application.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(application.id)}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(application.id, checked === true)
                    }
                    disabled={application.status !== 'pending'}
                  />
                </TableCell>
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell>{formatDate(application.created_at)}</TableCell>
                <TableCell>{getStatusBadge(application.status)}</TableCell>
                <TableCell>
                  {application.message ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewMessage(application.message || '')}
                    >
                      View Message
                    </Button>
                  ) : (
                    <span className="text-gray-400">No message</span>
                  )}
                </TableCell>
                <TableCell>
                  {application.status === 'accepted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRateVolunteer(application.id, application.volunteer_rating)}
                      className="flex items-center gap-2"
                    >
                      {renderRatingStars(application.volunteer_rating)}
                      <span className="ml-1">
                        {application.volunteer_rating ? "Edit Rating" : "Rate Volunteer"}
                      </span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {applications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No applications found</p>
        </div>
      )}

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Message</DialogTitle>
            <DialogDescription>
              Message from the volunteer:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <p className="whitespace-pre-wrap">{currentMessage}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Volunteer</DialogTitle>
            <DialogDescription>
              Please rate the volunteer's performance for this opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer ${
                  star <= currentRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                }`}
                onClick={() => setCurrentRating(star)}
              />
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRating}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationsTable;
