import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ dataset: string; source: string }>;
  visualizations?: any;
  timestamp: Date;
}

const EXAMPLE_QUESTIONS = [
  "Compare the average annual rainfall in Maharashtra and Punjab for the last 5 years. List the top 3 most produced crops in each state.",
  "Which district in Uttar Pradesh had the highest wheat production in 2022?",
  "Analyze the rice production trend in Eastern India over the last decade.",
  "What are 3 data-backed arguments for promoting drought-resistant crops in Rajasthan?",
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(crypto.randomUUID());
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("query-data", {
        body: {
          question: messageText,
          sessionId: sessionId.current,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        visualizations: data.visualizations,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error querying data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-fade-in">
          <div className="text-center space-y-4 max-w-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">AgriData Intelligence</h1>
            <p className="text-xl text-muted-foreground">
              Ask questions about Indian agricultural and climate data in natural language
            </p>
          </div>

          <div className="w-full max-w-3xl space-y-4">
            <h2 className="text-lg font-semibold text-center mb-4">Try these examples:</h2>
            <div className="grid gap-3">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:shadow-lg transition-smooth hover:border-primary/50 bg-card"
                  onClick={() => handleExampleClick(question)}
                >
                  <p className="text-sm">{question}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing data...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="border-t bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a question about agricultural data..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="bg-gradient-primary hover:opacity-90 transition-smooth"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
