
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Search, MessageCircle } from 'lucide-react';
import type { Application, Opportunity } from '@/types/opportunity';

const VolunteerDashboard = () => {
  const { user, loading, isVolunteer } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('applications');

  // Fetch applications submitted by the volunteer
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['volunteer-applications'],
    queryFn: async () => {
      if (!user) return null;
      
      console.log("Fetching applications for user:", user.id);
      const { data, error } = await supabase
        .from('applications')
        .select('*, opportunities(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
      
      console.log("Applications fetched:", data);
      return data as (Application & { opportunities: Opportunity })[];
    },
    enabled: !!user,
  });

  // Redirect if user is not logged in or not a volunteer
  React.useEffect(() => {
    console.log("VolunteerDashboard useEffect. User:", user?.email, "Loading:", loading, "Is volunteer:", isVolunteer());
    
    if (!loading) {
      if (!user) {
        console.log("No user detected, redirecting to login");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be logged in to view this page.",
        });
        navigate('/login');
      } else if (!isVolunteer()) {
        console.log("User is not a volunteer, redirecting to opportunities");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Only volunteers can access this dashboard.",
        });
        navigate('/opportunities');
      }
    }
  }, [user, loading, isVolunteer, navigate, toast]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-2">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
          <Button onClick={() => navigate('/opportunities')} className="bg-volunteer-600 hover:bg-volunteer-700 text-white">
            <Search className="mr-2 h-4 w-4" />
            Find Opportunities
          </Button>
        </div>

        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="applications" onClick={() => setActiveTab('applications')}>
              My Applications
            </TabsTrigger>
            <TabsTrigger value="upcoming" onClick={() => setActiveTab('upcoming')}>
              Upcoming Volunteering
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            {applications && applications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map(application => (
                  <Card key={application.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{application.opportunities?.title || 'Unknown Opportunity'}</CardTitle>
                        {getStatusBadge(application.status)}
                      </div>
                      <CardDescription className="mt-2">{application.opportunities?.organization || ''}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Date:</span>
                          <span>{application.opportunities?.date || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Location:</span>
                          <span>{application.opportunities?.location || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Applied on:</span>
                          <span>{formatDate(application.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <span>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex flex-col gap-2">
                      <Button 
                        className="w-full bg-volunteer-600 hover:bg-volunteer-700 text-white" 
                        onClick={() => navigate(`/opportunity/${application.opportunity_id}`)}
                      >
                        View Opportunity
                      </Button>
                      
                      {application.status === 'accepted' && (
                        <Button 
                          className="w-full bg-volunteer-100 hover:bg-volunteer-200 text-volunteer-800 border border-volunteer-300" 
                          onClick={() => navigate(`/opportunity/${application.opportunity_id}?tab=chat`)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Group Chat
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No applications submitted yet</h3>
                <p className="text-gray-600 mb-4">Start by browsing opportunities and applying to ones that interest you.</p>
                <Button onClick={() => navigate('/opportunities')} className="bg-volunteer-600 hover:bg-volunteer-700 text-white">
                  Browse Opportunities
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {applications && applications.filter(app => app.status === 'accepted').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications
                  .filter(app => app.status === 'accepted')
                  .map(application => (
                    <Card key={application.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-xl">{application.opportunities?.title || 'Unknown Opportunity'}</CardTitle>
                        <CardDescription className="mt-2">{application.opportunities?.organization || ''}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Date:</span>
                            <span>{application.opportunities?.date || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Location:</span>
                            <span>{application.opportunities?.location || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Category:</span>
                            <span>{application.opportunities?.category || 'Unknown'}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex flex-col gap-2">
                        <Button 
                          className="w-full flex items-center bg-volunteer-600 hover:bg-volunteer-700 text-white"
                          onClick={() => navigate(`/opportunity/${application.opportunity_id}`)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        
                        <Button 
                          className="w-full bg-volunteer-100 hover:bg-volunteer-200 text-volunteer-800 border border-volunteer-300" 
                          onClick={() => navigate(`/opportunity/${application.opportunity_id}?tab=chat`)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Group Chat
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No upcoming volunteering</h3>
                <p className="text-gray-600 mb-4">You don't have any assigned volunteer opportunities yet.</p>
                <Button onClick={() => navigate('/opportunities')} className="bg-volunteer-600 hover:bg-volunteer-700 text-white">
                  Find Opportunities
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default VolunteerDashboard;
