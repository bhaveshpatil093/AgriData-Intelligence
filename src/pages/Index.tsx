import { ChatInterface } from "@/components/ChatInterface";
import { DatasetPanel } from "@/components/DatasetPanel";
import { DataSeeder } from "@/components/DataSeeder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Database, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <DataSeeder />
      
      <header className="border-b border-border/50 bg-card/95 backdrop-blur-md shadow-sm sticky top-0 z-10 flex-shrink-0">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                AgriData Intelligence
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Natural language queries for Indian agricultural and climate data
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden min-h-0">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <div className="border-b border-border/50 bg-card/60 backdrop-blur-sm flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 py-2">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1 h-auto">
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all py-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="datasets" 
                  className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all py-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Datasets</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 m-0 p-0 min-h-0">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="datasets" className="flex-1 m-0 p-0 min-h-0">
            <DatasetPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
