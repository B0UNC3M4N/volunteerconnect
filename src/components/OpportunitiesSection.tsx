
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Opportunity } from '@/types/opportunity';

const OpportunitiesSection = () => {
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['featured-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data as Opportunity[];
    },
  });

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Opportunities</h2>
            <p className="text-gray-600 max-w-2xl">
              Discover meaningful volunteer opportunities that match your skills and interests.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start md:self-end text-volunteer-700 border-volunteer-700 hover:bg-volunteer-50">
            <Link to="/opportunities">View All Opportunities</Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        ) : opportunities && opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-[4/3] w-full relative">
                  <img 
                    src={opportunity.image_url || '/placeholder.svg'} 
                    alt={opportunity.title} 
                    className="object-cover w-full h-full"
                  />
                  <Badge className="absolute top-3 right-3 bg-white text-volunteer-700 hover:bg-gray-100">
                    {opportunity.category}
                  </Badge>
                  {opportunity.urgent && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white hover:bg-red-600">
                      Urgent
                    </Badge>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{opportunity.title}</h3>
                  <p className="text-gray-600 text-sm">{opportunity.organization}</p>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{opportunity.date}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-volunteer-600 hover:bg-volunteer-700 text-white">
                    <Link to={`/opportunity/${opportunity.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p>No opportunities available at this time.</p>
            <Button asChild className="mt-4 bg-volunteer-600 hover:bg-volunteer-700 text-white">
              <Link to="/post-opportunity">Post an Opportunity</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OpportunitiesSection;
