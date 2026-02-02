import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlueprints } from '@/hooks/useBlueprints';
import { useProjects } from '@/hooks/useProjects';
import { Loader2, Upload, File, X } from 'lucide-react';

interface BlueprintUploadDialogProps {
  projectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlueprintUploadDialog({ projectId, open, onOpenChange }: BlueprintUploadDialogProps) {
  const { uploadBlueprint } = useBlueprints();
  const { projects } = useProjects();
  const [name, setName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProjectId = projectId || selectedProjectId;
    if (!file || !targetProjectId) return;

    await uploadBlueprint.mutateAsync({
      file,
      projectId: targetProjectId,
      name,
    });

    setName('');
    setFile(null);
    setSelectedProjectId(projectId || '');
    onOpenChange(false);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const targetProjectId = projectId || selectedProjectId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Blueprint</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!projectId && (
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Blueprint Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Floor Plan v1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>File *</Label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.dwg,.dxf"
              className="hidden"
            />
            
            {file ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <File className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{file.name}</span>
                <Button type="button" variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select file
                  </span>
                </div>
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || !targetProjectId || uploadBlueprint.isPending}>
              {uploadBlueprint.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
