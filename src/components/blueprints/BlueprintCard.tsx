import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBlueprints, Blueprint } from '@/hooks/useBlueprints';
import { FileText, Download, Trash2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BlueprintCardProps {
  blueprint: Blueprint;
}

export function BlueprintCard({ blueprint }: BlueprintCardProps) {
  const { deleteBlueprint, getSignedUrl } = useBlueprints();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await getSignedUrl(blueprint.file_url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
    setIsDownloading(false);
  };

  const handleView = async () => {
    try {
      const url = await getSignedUrl(blueprint.file_url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get view URL:', error);
    }
  };

  const getFileIcon = () => {
    if (blueprint.file_type?.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (blueprint.file_type?.includes('image')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{blueprint.name}</p>
          <p className="text-xs text-muted-foreground">
            v{blueprint.version} • {format(new Date(blueprint.uploaded_at), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Blueprint?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{blueprint.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteBlueprint.mutate(blueprint)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
