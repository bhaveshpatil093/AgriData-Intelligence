import { ChatInterface } from "@/components/ChatInterface";
import { DatasetPanel } from "@/components/DatasetPanel";
import { DataSeeder } from "@/components/DataSeeder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Database } from "lucide-react";

const Index = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-subtle">
      <DataSeeder />
      
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AgriData Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Natural language queries for Indian agricultural and climate data
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <div className="border-b bg-card">
            <div className="container mx-auto px-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="datasets" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Datasets
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 m-0">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="datasets" className="flex-1 m-0">
            <DatasetPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
