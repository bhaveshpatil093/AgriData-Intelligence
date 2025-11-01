import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DataSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAndSeedData();
  }, []);

  const checkAndSeedData = async () => {
    try {
      // Check if datasets exist
      const { data: datasets, error } = await supabase
        .from("datasets")
        .select("id")
        .limit(1);

      if (error) throw error;

      if (!datasets || datasets.length === 0) {
        // Seed the datasets
        setIsSeeding(true);
        const { error: seedError } = await supabase.functions.invoke("seed-datasets");

        if (seedError) throw seedError;

        setIsSeeded(true);
        toast({
          title: "Datasets loaded",
          description: "Sample agricultural and rainfall data has been loaded successfully.",
        });
      } else {
        setIsSeeded(true);
      }
    } catch (error: any) {
      console.error("Error seeding data:", error);
      toast({
        title: "Error",
        description: "Failed to load sample datasets. Some features may be limited.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isSeeding) {
    return (
      <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          <span className="text-sm">Loading sample datasets...</span>
        </div>
      </div>
    );
  }

  return null;
};
