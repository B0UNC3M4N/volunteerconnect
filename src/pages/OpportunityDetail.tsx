import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useApplication } from '@/hooks/useApplication';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isNonprofit } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const { application, submitApplication } = useApplication(id || '');

  // Fetch the opportunity details
  const { data: opportunity, isLoading, error } = useQuery({
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
  
  // Fetch applications count for this opportunity
  const { data: applicationsCount } = useQuery({
    queryKey: ['applications-count', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('opportunity_id', id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!id && isNonprofit(),
  });

  const handleApplyClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to sign in to apply for opportunities.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnUrl: `/opportunity/${id}` } });
      return;
    }

    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!applicationMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a brief message to the organization.",
        variant: "destructive",
      });
      return;
    }

    await submitApplication.mutateAsync(applicationMessage);
    setIsApplyDialogOpen(false);
    setApplicationMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2">Loading opportunity details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Opportunity Not Found</h1>
            <p className="mb-4">The opportunity you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/opportunities">Back to Opportunities</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Back navigation */}
          <div className="mb-6">
            <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-volunteer-700">
              <Link to="/opportunities" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Opportunities
              </Link>
            </Button>
          </div>
          
          {/* Show manage applications button for nonprofits */}
          {isNonprofit() && opportunity && (
            <div className="mb-6">
              <Button 
                asChild 
                variant="outline"
                className="border-volunteer-600 text-volunteer-600 hover:bg-volunteer-50"
              >
                <Link to={`/manage-applications/${id}`} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Applications
                  {applicationsCount !== undefined && applicationsCount > 0 && (
                    <Badge className="ml-2 bg-volunteer-100 text-volunteer-800 hover:bg-volunteer-100">{applicationsCount}</Badge>
                  )}
                </Link>
              </Button>
            </div>
          )}
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content - left side */}
            <div className="md:col-span-2 space-y-6">
              {/* Hero image */}
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={opportunity.image_url || '/placeholder.svg'} 
                  alt={opportunity.title} 
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-volunteer-700 hover:bg-gray-100">
                    {opportunity.category}
                  </Badge>
                </div>
                {opportunity.urgent && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white">
                      Urgent
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Opportunity title and basic info */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
                <div className="flex items-center mb-4">
                  <span className="text-gray-700">{opportunity.organization}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{opportunity.date}</span>
                  </div>
                </div>
              </div>
              
              {/* Opportunity description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Opportunity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{opportunity.description}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar - right side */}
            <div>
              {/* Apply Now Card */}
              <Card className="sticky top-20">
                <CardHeader className="bg-volunteer-50">
                  <CardTitle className="text-center">Ready to Volunteer?</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {application ? (
                    <div className="text-center">
                      <div className="bg-green-50 text-green-700 rounded-md p-4 mb-4">
                        <p className="font-medium">Application Submitted</p>
                        <p className="text-sm mt-1">Thank you for your interest!</p>
                      </div>
                      <p className="text-gray-600 text-sm">You have already applied for this opportunity.</p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-volunteer-600 hover:bg-volunteer-700 text-white mb-4"
                      onClick={handleApplyClick}
                    >
                      Apply Now
                    </Button>
                  )}
                  
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="font-medium mb-2">Contact Information</h3>
                    
                    <div className="flex">
                      <div className="w-8 flex-shrink-0 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-volunteer-600 hover:underline">
                          Contact through application
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-8 flex-shrink-0 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p>{opportunity.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col bg-gray-50">
                  <div className="w-full text-center">
                    <p className="text-gray-500 text-sm mb-2">Share this opportunity</p>
                    <div className="flex justify-center gap-4">
                      <button className="text-gray-500 hover:text-volunteer-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="text-gray-500 hover:text-volunteer-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Application Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for "{opportunity.title}"</DialogTitle>
            <DialogDescription>
              Share a brief message about why you're interested in this volunteer opportunity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Tell the organization why you're interested in volunteering and any relevant experience you have."
              className="min-h-[150px]"
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmitApplication}
              disabled={submitApplication.isPending}
            >
              {submitApplication.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunityDetail;
