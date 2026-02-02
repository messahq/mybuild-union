import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Blueprint {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  version: number;
  uploaded_at: string;
}

export function useBlueprints(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: blueprints = [], isLoading } = useQuery({
    queryKey: ['blueprints', projectId],
    queryFn: async () => {
      let query = supabase.from('blueprints').select('*').order('uploaded_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Blueprint[];
    },
    enabled: !!user,
  });

  const uploadBlueprint = useMutation({
    mutationFn: async ({ 
      file, 
      projectId, 
      name 
    }: { 
      file: File; 
      projectId: string; 
      name: string;
    }) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}/${projectId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blueprints')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blueprints')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('blueprints')
        .insert({
          user_id: user!.id,
          project_id: projectId,
          name,
          file_url: filePath,
          file_type: file.type,
        })
        .select()
        .single();

      if (error) throw error;

      await logActivity('blueprint_uploaded', `Uploaded blueprint: ${name}`, projectId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Blueprint uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload blueprint: ' + error.message);
    },
  });

  const deleteBlueprint = useMutation({
    mutationFn: async (blueprint: Blueprint) => {
      await supabase.storage.from('blueprints').remove([blueprint.file_url]);

      const { error } = await supabase
        .from('blueprints')
        .delete()
        .eq('id', blueprint.id);

      if (error) throw error;

      await logActivity('blueprint_deleted', `Deleted blueprint: ${blueprint.name}`, blueprint.project_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blueprints'] });
      toast.success('Blueprint deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete blueprint: ' + error.message);
    },
  });

  const getSignedUrl = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('blueprints')
      .createSignedUrl(filePath, 3600);
    
    if (error) throw error;
    return data.signedUrl;
  };

  const logActivity = async (action: string, description: string, projectId?: string) => {
    if (!user) return;
    
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      project_id: projectId || null,
      action,
      description,
    });
    
    queryClient.invalidateQueries({ queryKey: ['activity'] });
  };

  return {
    blueprints,
    isLoading,
    uploadBlueprint,
    deleteBlueprint,
    getSignedUrl,
  };
}
