
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ApplicationsTable, { ApplicationData } from '@/components/ApplicationsTable';

interface ApplicationManagementProps {
  applications: ApplicationData[];
  opportunityId: string;
}

const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  applications,
  opportunityId,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplications, setSelectedApplications] = React.useState<string[]>([]);
  const assignedCount = applications?.filter(app => app.status === 'accepted').length || 0;

  const updateApplicationStatus = useMutation({
    mutationFn: async (newStatus: 'accepted' | 'rejected') => {
      if (selectedApplications.length === 0) {
        throw new Error('No applications selected');
      }
      
      console.log(`Updating applications with IDs: ${selectedApplications.join(', ')} to ${newStatus}`);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .in('id', selectedApplications);
        
      if (error) {
        console.error("Error updating applications:", error);
        throw error;
      }

      // If accepting applications, create or update chat room and send notifications
      if (newStatus === 'accepted') {
        // Create chat room if it doesn't exist
        await ensureChatRoomExists(opportunityId);
        
        // Get emails of selected applicants for notifications
        const selectedApplicants = applications?.filter(app => 
          selectedApplications.includes(app.id)
        ) || [];
        
        // In a real application, this would call a separate notification service or API
        // Here we just log it as a demonstration
        console.log(`Sending assignment notifications to: ${
          selectedApplicants.map(app => app.users.email).join(', ')
        }`);
        
        // This is where you would integrate with a real notification system
        toast({
          title: "Notifications sent",
          description: `Assignment notifications have been sent to ${selectedApplicants.length} volunteer${selectedApplicants.length > 1 ? 's' : ''}.`,
        });
      }

      return { status: newStatus, count: selectedApplications.length };
    },
    onSuccess: (data) => {
      const actionText = data.status === 'accepted' ? 'assigned' : 'rejected';
      toast({
        title: `Volunteers ${actionText}`,
        description: `${data.count} volunteer${data.count > 1 ? 's' : ''} have been ${actionText}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['applications', opportunityId] });
      setSelectedApplications([]);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });

  const ensureChatRoomExists = async (opportunityId: string) => {
    try {
      // Check if chat room exists
      const { data: existingRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('opportunity_id', opportunityId)
        .single();

      if (roomError && roomError.code !== 'PGRST116') { // Not found is okay
        throw roomError;
      }

      // If room exists, we're done
      if (existingRoom) return existingRoom.id;

      // Create new chat room
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          opportunity_id: opportunityId
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add system message about volunteer assignment
      await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: newRoom.id,
          sender_id: (await supabase.auth.getSession()).data.session?.user.id!,
          message: 'New volunteers have been assigned to this opportunity',
          is_system_message: true
        });

      return newRoom.id;
    } catch (error) {
      console.error('Error ensuring chat room exists:', error);
      throw error;
    }
  };

  const handleSelectApplication = (applicationId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedApplications(prev => [...prev, applicationId]);
    } else {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId));
    }
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Manage Applications</CardTitle>
        <CardDescription>
          Review and assign volunteers for this opportunity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications && applications.length > 0 ? (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <span className="text-sm font-medium">
                  {applications.length} Application{applications.length !== 1 ? 's' : ''}
                </span>
                {assignedCount > 0 && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {assignedCount} Assigned
                  </Badge>
                )}
              </div>
              <div className="space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      disabled={selectedApplications.length === 0}
                    >
                      Reject Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to reject {selectedApplications.length} volunteer{selectedApplications.length !== 1 ? 's' : ''}. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => updateApplicationStatus.mutate('rejected')}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {updateApplicationStatus.isPending ? 'Processing...' : 'Yes, Reject'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={selectedApplications.length === 0}
                      className="bg-volunteer-600 hover:bg-volunteer-700"
                    >
                      Assign Selected
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to assign {selectedApplications.length} volunteer{selectedApplications.length !== 1 ? 's' : ''} to this opportunity.
                        They will be notified of their assignment and added to the group chat.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => updateApplicationStatus.mutate('accepted')}
                      >
                        {updateApplicationStatus.isPending ? 'Processing...' : 'Confirm Assignment'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            <ApplicationsTable 
              applications={applications} 
              selectedIds={selectedApplications}
              onSelectApplication={handleSelectApplication}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No applications have been received for this opportunity yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApplicationManagement;
