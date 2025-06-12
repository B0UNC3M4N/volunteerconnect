
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Application } from '@/types/opportunity';

export function useApplication(opportunityId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', opportunityId],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return null;
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          volunteer_reviews(rating, comments)
        `)
        .eq('opportunity_id', opportunityId)
        .eq('user_id', session.session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Transform the data to ensure volunteer_reviews is always an array
      if (data) {
        const reviews = Array.isArray(data.volunteer_reviews) 
          ? data.volunteer_reviews 
          : data.volunteer_reviews 
            ? [data.volunteer_reviews] 
            : [];
            
        return {
          ...data,
          volunteer_reviews: reviews
        } as Application & { volunteer_reviews: { rating: number, comments: string | null }[] };
      }
      
      return null;
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (message: string) => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error('You must be logged in to apply for opportunities');
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: opportunityId,
          user_id: session.session.user.id,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your application has been successfully submitted.",
      });
      queryClient.invalidateQueries({ queryKey: ['application', opportunityId] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return {
    application,
    isLoading,
    submitApplication,
  };
}
