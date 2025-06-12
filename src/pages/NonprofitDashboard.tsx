
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus } from 'lucide-react';
import OpportunitiesList from '@/components/dashboard/OpportunitiesList';
import ApplicationsList from '@/components/dashboard/ApplicationsList';
import { formatDate } from '@/utils/formatters';
import type { Opportunity, Application } from '@/types/opportunity';

const NonprofitDashboard = () => {
  const { user, loading, isNonprofit } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('opportunities');

  // Fetch opportunities posted by this nonprofit
  const { data: opportunities, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ['nonprofit-opportunities'],
    queryFn: async () => {
      if (!user) return null;
      
      console.log("Fetching opportunities for nonprofit:", user.id);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching opportunities:", error);
        throw error;
      }
      
      console.log("Opportunities fetched:", data);
      return data as Opportunity[];
    },
    enabled: !!user && isNonprofit(),
  });

  // Fetch all applications for this nonprofit's opportunities
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['nonprofit-applications'],
    queryFn: async () => {
      if (!user || !opportunities) return null;
      
      const opportunityIds = opportunities.map(opp => opp.id);
      
      if (opportunityIds.length === 0) return [];
      
      console.log("Fetching applications for opportunities:", opportunityIds);
      
      // First fetch the applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .in('opportunity_id', opportunityIds);
      
      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }
      
      if (!applicationsData || applicationsData.length === 0) {
        return [];
      }
      
      console.log("Applications fetched:", applicationsData);
      
      // Then fetch profiles for each application
      const enhancedApplications = await Promise.all(applicationsData.map(async (app) => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', app.user_id)
          .single();
        
        return {
          ...app,
          profiles: profileError ? null : profileData
        };
      }));
      
      console.log("Enhanced applications:", enhancedApplications);
      return enhancedApplications as Application[];
    },
    enabled: !!user && isNonprofit() && !!opportunities,
  });

  // Redirect if user is not logged in or not a nonprofit
  React.useEffect(() => {
    console.log("NonprofitDashboard useEffect. User:", user?.email, "Loading:", loading, "Is nonprofit:", isNonprofit());
    
    if (!loading) {
      if (!user) {
        console.log("No user detected, redirecting to login");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be logged in to view this page.",
        });
        navigate('/login');
      } else if (!isNonprofit()) {
        console.log("User is not a nonprofit, redirecting to opportunities");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Only nonprofits can access this dashboard.",
        });
        navigate('/opportunities');
      }
    }
  }, [user, loading, isNonprofit, navigate, toast]);

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

  if (isLoadingOpportunities || isLoadingApplications) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-2">Loading dashboard data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Nonprofit Dashboard</h1>
          <Button onClick={() => navigate('/post-opportunity')} className="bg-nonprofit-600 hover:bg-nonprofit-700 text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Post New Opportunity
          </Button>
        </div>

        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="opportunities" onClick={() => setActiveTab('opportunities')}>
              Opportunities
            </TabsTrigger>
            <TabsTrigger value="applications" onClick={() => setActiveTab('applications')}>
              Applications
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="opportunities">
            {opportunities && (
              <OpportunitiesList 
                opportunities={opportunities}
                applications={applications || []}
                onPostNew={() => navigate('/post-opportunity')}
              />
            )}
          </TabsContent>

          <TabsContent value="applications">
            {applications ? (
              applications.length > 0 ? (
                <ApplicationsList 
                  applications={applications} 
                  opportunities={opportunities || []}
                  formatDate={formatDate}
                />
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No applications received yet</h3>
                  <p className="text-gray-600 mb-4">Once you post opportunities and volunteers apply, you'll see their applications here.</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2">Loading applications...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default NonprofitDashboard;
