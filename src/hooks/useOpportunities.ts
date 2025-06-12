
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Opportunity, SearchFilters } from '@/types/opportunity';

export function useOpportunities(filters: SearchFilters = {}) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      let query = supabase
        .from('opportunities')
        .select('*');

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.date) {
        query = query.eq('date', filters.date);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Opportunity[];
    },
  });
}
