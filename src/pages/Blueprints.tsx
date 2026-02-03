import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlueprints } from '@/hooks/useBlueprints';
import { useProjects } from '@/hooks/useProjects';
import { Search, FileText, Upload } from 'lucide-react';
import { BlueprintCard } from '@/components/blueprints/BlueprintCard';
import { BlueprintUploadDialog } from '@/components/blueprints/BlueprintUploadDialog';

export default function Blueprints() {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  
  const { blueprints, isLoading } = useBlueprints(
    selectedProject === 'all' ? undefined : selectedProject
  );

  const filteredBlueprints = blueprints.filter((bp) =>
    bp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blueprints</h1>
            <p className="text-muted-foreground">View and manage all project blueprints</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Blueprint
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search blueprints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-16" />
              </Card>
            ))}
          </div>
        ) : filteredBlueprints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No blueprints found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Upload Blueprint" to add your first blueprint
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {filteredBlueprints.map((blueprint) => (
              <BlueprintCard key={blueprint.id} blueprint={blueprint} />
            ))}
          </div>
        )}

      <BlueprintUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
