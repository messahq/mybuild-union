import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects, Project, ProjectStatus } from '@/hooks/useProjects';
import { useBlueprints } from '@/hooks/useBlueprints';
import { useActivity } from '@/hooks/useActivity';
import { Loader2, Pencil, Trash2, MapPin, Calendar, DollarSign, FileText, Upload } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BlueprintUploadDialog } from '@/components/blueprints/BlueprintUploadDialog';
import { BlueprintCard } from '@/components/blueprints/BlueprintCard';

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  on_hold: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
  const { updateProject, deleteProject } = useProjects();
  const { blueprints } = useBlueprints(project?.id);
  const { activities } = useActivity(project?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});

  if (!project) return null;

  const handleEdit = () => {
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      location: project.location || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || undefined,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProject.mutateAsync({
      id: project.id,
      ...formData,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync(project.id);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-xl font-bold"
                  />
                ) : (
                  <DialogTitle className="text-xl">{project.name}</DialogTitle>
                )}
              </div>
              <Badge className={STATUS_STYLES[project.status]}>
                {STATUS_LABELS[project.status]}
              </Badge>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="blueprints">
                Blueprints ({blueprints.length})
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: ProjectStatus) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={formData.start_date || ''}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.end_date || ''}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Budget ($)</Label>
                    <Input
                      type="number"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateProject.isPending}>
                      {updateProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {project.description && (
                    <p className="text-muted-foreground">{project.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {project.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{project.location}</span>
                      </div>
                    )}
                    {project.start_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(project.start_date), 'MMM d, yyyy')}
                          {project.end_date && ` - ${format(new Date(project.end_date), 'MMM d, yyyy')}`}
                        </span>
                      </div>
                    )}
                    {project.budget && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${project.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handleEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{project.name}" and all associated blueprints.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="blueprints" className="mt-4">
              <div className="space-y-4">
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Blueprint
                </Button>

                {blueprints.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No blueprints uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {blueprints.map((blueprint) => (
                      <BlueprintCard key={blueprint.id} blueprint={blueprint} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No activity recorded
                </div>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <BlueprintUploadDialog
        projectId={project.id}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </>
  );
}
