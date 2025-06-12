
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface VolunteerRatingsProps {
  userId: string;
}

const VolunteerRatings = ({ userId }: VolunteerRatingsProps) => {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['volunteer-ratings', userId],
    queryFn: async () => {
      // Get all applications by this volunteer
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('id, opportunity_id, status')
        .eq('user_id', userId)
        .eq('status', 'accepted');
      
      if (appError) throw appError;
      
      if (!applications || applications.length === 0) {
        return { ratings: [], averageRating: 0 };
      }
      
      // Get all ratings for these applications
      const applicationIds = applications.map(app => app.id);
      
      const { data: ratingData, error: ratingError } = await supabase
        .from('volunteer_reviews')
        .select('rating, comments, application_id')
        .in('application_id', applicationIds);
      
      if (ratingError) throw ratingError;
      
      // Get opportunity details for each rating
      const ratingsWithDetails = await Promise.all((ratingData || []).map(async (rating) => {
        const application = applications.find(app => app.id === rating.application_id);
        
        if (!application) return { ...rating, opportunity: { title: 'Unknown Opportunity' } };
        
        const { data: opportunity } = await supabase
          .from('opportunities')
          .select('title')
          .eq('id', application.opportunity_id)
          .single();
        
        return {
          ...rating,
          opportunity: opportunity || { title: 'Unknown Opportunity' }
        };
      }));
      
      // Calculate average rating
      const totalRating = ratingsWithDetails.reduce((sum, item) => sum + item.rating, 0);
      const averageRating = ratingsWithDetails.length > 0 ? 
        Math.round((totalRating / ratingsWithDetails.length) * 10) / 10 : 0;
      
      return { 
        ratings: ratingsWithDetails,
        averageRating
      };
    },
    enabled: !!userId
  });
  
  const renderStars = (rating: number) => {
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
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Ratings</CardTitle>
          <CardDescription>Loading your performance ratings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!ratings || ratings.ratings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Ratings</CardTitle>
          <CardDescription>You haven't received any ratings yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Complete opportunities to receive ratings from nonprofits.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Ratings</CardTitle>
        <CardDescription className="flex items-center gap-2">
          Average Rating: {ratings.averageRating} 
          {renderStars(Math.round(ratings.averageRating))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ratings.ratings.map((rating, index) => (
            <div key={index} className="border-b pb-3 last:border-b-0">
              <div className="flex justify-between items-center">
                <p className="font-medium">{rating.opportunity.title}</p>
                {renderStars(rating.rating)}
              </div>
              {rating.comments && (
                <p className="text-sm text-gray-600 mt-1">{rating.comments}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VolunteerRatings;
