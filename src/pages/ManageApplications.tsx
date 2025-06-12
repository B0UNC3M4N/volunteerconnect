
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ApplicationData } from '@/components/ApplicationsTable';
import OpportunityHeader from '@/components/OpportunityHeader';
import OpportunityDetailsSidebar from '@/components/OpportunityDetailsSidebar';
import ApplicationManagement from '@/components/ApplicationManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OpportunityChatTab from '@/components/OpportunityChatTab';

const ManageApplications = () => {
  const { id } = useParams();
  const { user, isNonprofit } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [assignedCount, setAssignedCount] = useState<number>(0);
  
  // Get tab from URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl === 'chat' ? 'chat' : 'applications'
  );

  // Fetch the opportunity details
  const { data: opportunity, isLoading: isLoadingOpportunity } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch applications for this opportunity
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      console.log("Fetching applications for opportunity:", id);
      
      // Get applications first
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('opportunity_id', id);
      
      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        throw applicationsError;
      }

      if (!applicationsData || applicationsData.length === 0) {
        return [];
      }

      // Then get profile data for each application
      const transformedData = await Promise.all(applicationsData.map(async (app) => {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', app.user_id)
          .single();
        
        // Fetch rating data
        const { data: ratingData, error: ratingError } = await supabase
          .from('volunteer_reviews')
          .select('rating')
          .eq('application_id', app.id)
          .maybeSingle();
        
        // If profile fetch fails, provide default values
        const profile = profileError ? {
          email: 'Unknown Email',
          first_name: 'Unknown',
          last_name: 'User'
        } : profileData;
        
        return {
          ...app,
          users: {
            email: profile.email,
            raw_user_meta_data: {
              first_name: profile.first_name || 'Unknown',
              last_name: profile.last_name || 'User'
            }
          },
          profiles: profile,
          volunteer_rating: ratingData?.rating || null
        };
      }));
      
      console.log("Applications with profile data:", transformedData);
      return transformedData as ApplicationData[];
    },
    enabled: !!id && isNonprofit(),
  });

  // Count the number of assigned volunteers
  useEffect(() => {
    if (applications) {
      const count = applications.filter(app => app.status === 'accepted').length;
      setAssignedCount(count);
    }
  }, [applications]);

  // Handle tab changes and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without full page reload
    const newSearchParams = new URLSearchParams(location.search);
    if (value === 'chat') {
      newSearchParams.set('tab', 'chat');
    } else {
      newSearchParams.delete('tab');
    }
    
    const newSearch = newSearchParams.toString();
    const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    navigate(newPath, { replace: true });
  };

  // Redirect if user is not a nonprofit
  React.useEffect(() => {
    if (user && !isNonprofit()) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only nonprofits can access this page.",
      });
      navigate('/opportunities');
    }
  }, [user, isNonprofit, navigate, toast]);

  if (isLoadingOpportunity || isLoadingApplications) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2">Loading applications...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Opportunity Not Found</h1>
            <p className="mb-4">The opportunity you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Only show chat tab if there are assigned volunteers
  const hasAssignedVolunteers = assignedCount > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        {opportunity && <OpportunityHeader opportunity={opportunity} />}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="chat" disabled={!hasAssignedVolunteers}>
              Group Chat {!hasAssignedVolunteers && "(Assign volunteers first)"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ApplicationManagement 
                applications={applications || []} 
                opportunityId={id || ''}
              />
              
              <OpportunityDetailsSidebar 
                opportunity={opportunity} 
                applications={applications}
                assignedCount={assignedCount}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="chat">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2">
                <OpportunityChatTab 
                  opportunityId={id || ''} 
                  opportunityTitle={opportunity.title} 
                />
              </div>
              
              <OpportunityDetailsSidebar 
                opportunity={opportunity} 
                applications={applications}
                assignedCount={assignedCount}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default ManageApplications;
