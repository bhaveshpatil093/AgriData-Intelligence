import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Calendar, FileText, Search, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  name: string;
  description: string;
  fields: any;
  data: any[];
  created_at: string;
  source_url?: string;
}

export const DatasetPanel = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(new Set());
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [filteredData, setFilteredData] = useState<Record<string, any[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, description, fields, data, created_at, source_url")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const loadedDatasets = (data || []).map((ds) => ({
        ...ds,
        data: Array.isArray(ds.data) ? ds.data : [],
      }));
      setDatasets(loadedDatasets);
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

  const toggleDataset = (datasetId: string) => {
    const newExpanded = new Set(expandedDatasets);
    if (newExpanded.has(datasetId)) {
      newExpanded.delete(datasetId);
    } else {
      newExpanded.add(datasetId);
    }
    setExpandedDatasets(newExpanded);
  };

  const filterData = (dataset: Dataset, query: string) => {
    if (!query.trim()) {
      return dataset.data;
    }

    const lowerQuery = query.toLowerCase();
    return dataset.data.filter((row: any) => {
      return Object.values(row).some((value: any) =>
        String(value).toLowerCase().includes(lowerQuery)
      );
    });
  };

  const handleSearch = (query: string, datasetId: string) => {
    setSearchQueries({
      ...searchQueries,
      [datasetId]: query,
    });
    
    const dataset = datasets.find((d) => d.id === datasetId);
    if (dataset) {
      const filtered = filterData(dataset, query);
      setFilteredData({
        ...filteredData,
        [datasetId]: filtered,
      });
    }
  };

  const getDisplayData = (dataset: Dataset) => {
    const query = searchQueries[dataset.id] || "";
    if (query.trim() && filteredData[dataset.id]) {
      return filteredData[dataset.id];
    }
    return dataset.data.slice(0, 100); // Show first 100 rows by default
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-background to-muted/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary/10 flex items-center justify-center mx-auto animate-pulse">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Loading datasets...</p>
            <p className="text-xs text-muted-foreground">Fetching available data sources</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-background to-muted/10 w-full">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 w-full">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold">Available Datasets</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {datasets.length} dataset{datasets.length !== 1 ? "s" : ""} loaded and ready for queries
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {datasets.map((dataset) => {
            const isExpanded = expandedDatasets.has(dataset.id);
            const displayData = getDisplayData(dataset);
            const totalRows = dataset.data.length;
            const searchQuery = searchQueries[dataset.id] || "";
            const showingRows = searchQuery.trim()
              ? (filteredData[dataset.id]?.length || 0)
              : Math.min(100, totalRows);
            const fieldKeys = Object.keys(dataset.fields);

            return (
              <Card 
                key={dataset.id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 bg-card"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors flex-shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1.5">{dataset.name}</CardTitle>
                        <CardDescription className="leading-relaxed">{dataset.description}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDataset(dataset.id)}
                      className="flex-shrink-0"
                    >
                      {isExpanded ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide Data
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          View Data
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Added {new Date(dataset.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span>{totalRows} rows</span>
                    </div>
                    {dataset.source_url && (
                      <a 
                        href={dataset.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Source
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fields ({fieldKeys.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {fieldKeys.slice(0, 6).map((field) => (
                        <Badge 
                          key={field} 
                          variant="secondary" 
                          className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                        >
                          {field}
                        </Badge>
                      ))}
                      {fieldKeys.length > 6 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs font-medium px-2.5 py-1 border-dashed"
                        >
                          +{fieldKeys.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 mt-4 border-t pt-4">
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            placeholder="Search within dataset..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value, dataset.id)}
                            className="pl-9"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="px-3 py-1.5">
                            Showing {showingRows} of {totalRows} rows
                          </Badge>
                          {totalRows > 100 && !searchQuery.trim() && (
                            <Badge variant="secondary" className="px-3 py-1.5 text-xs">
                              First 100 rows
                            </Badge>
                          )}
                        </div>
                      </div>

                        {displayData.length > 0 ? (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                              <Table>
                                <TableHeader className="sticky top-0 bg-muted/50">
                                  <TableRow>
                                    {fieldKeys.map((field) => (
                                      <TableHead 
                                        key={field}
                                        className="font-semibold text-xs sm:text-sm whitespace-nowrap"
                                      >
                                        {field}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {displayData.map((row: any, index: number) => (
                                    <TableRow 
                                      key={index}
                                      className="hover:bg-muted/30 transition-colors"
                                    >
                                      {fieldKeys.map((field) => (
                                        <TableCell 
                                          key={field}
                                          className="text-xs sm:text-sm whitespace-nowrap"
                                        >
                                          {row[field] !== null && row[field] !== undefined 
                                            ? String(row[field])
                                            : "-"
                                          }
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No data found matching your search.</p>
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {datasets.length === 0 && (
          <Card className="border-2 border-dashed bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">No datasets available</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Sample datasets will be loaded automatically when you start using the application
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
