import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivityLog {
  id: string;
  user_id: string;
  project_id: string | null;
  action: string;
  description: string | null;
  created_at: string;
}

export function useActivity(projectId?: string) {
  const { user } = useAuth();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!user,
  });

  return {
    activities,
    isLoading,
  };
}
