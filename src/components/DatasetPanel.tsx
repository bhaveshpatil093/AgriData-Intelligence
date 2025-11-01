import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  name: string;
  description: string;
  fields: any;
  created_at: string;
}

export const DatasetPanel = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, description, fields, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDatasets(data || []);
    } catch (error: any) {
      console.error("Error loading datasets:", error);
      toast({
        title: "Error",
        description: "Failed to load datasets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading datasets...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          Available Datasets
        </h2>
        <p className="text-sm text-muted-foreground">
          {datasets.length} dataset{datasets.length !== 1 ? "s" : ""} loaded
        </p>
      </div>

      <div className="space-y-4">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="hover:shadow-md transition-smooth">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {dataset.name}
              </CardTitle>
              <CardDescription>{dataset.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Added {new Date(dataset.created_at).toLocaleDateString()}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(dataset.fields).slice(0, 5).map((field) => (
                  <Badge key={field} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
                {Object.keys(dataset.fields).length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{Object.keys(dataset.fields).length - 5} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {datasets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No datasets available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Sample datasets will be loaded automatically
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
