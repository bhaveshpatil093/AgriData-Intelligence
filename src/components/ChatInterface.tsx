import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles, MessageSquare } from "lucide-react";
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

      if (error) {
        throw error;
      }

      // Check if response has an error field
      if (data?.error) {
        throw new Error(data.error);
      }

      // Validate response structure
      if (!data || !data.answer) {
        throw new Error("Invalid response from server");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "I apologize, but I couldn't generate a response. Please try rephrasing your question.",
        citations: data.citations || [],
        visualizations: data.visualizations || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error querying data:", error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I encountered an error while processing your question: ${error.message || "Unknown error"}. Please check your connection and try again, or rephrase your question.`,
        citations: [],
        visualizations: null,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
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
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-background to-muted/10 overflow-hidden">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-8 sm:space-y-10 animate-fade-in overflow-y-auto">
          <div className="text-center space-y-4 sm:space-y-5 max-w-2xl w-full px-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-primary shadow-2xl">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                AgriData Intelligence
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Ask questions about Indian agricultural and climate data in natural language
              </p>
            </div>
          </div>

          <div className="w-full max-w-3xl space-y-4 sm:space-y-5 px-4">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">Try these examples:</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Click on any question to get started</p>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <Card
                  key={index}
                  className="group p-4 sm:p-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-primary/50 bg-card border-2 hover:-translate-y-0.5"
                  onClick={() => handleExampleClick(question)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground transition-colors flex-1">
                      {question}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-background/50 to-background">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-muted-foreground p-4 bg-card/80 rounded-lg border border-border/50 shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Analyzing data...</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Processing your query</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="border-t border-border/50 bg-card/95 backdrop-blur-md shadow-lg p-3 sm:p-4 sticky bottom-0 flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Ask a question about agricultural data..."
                disabled={isLoading}
                className="pr-10 sm:pr-12 h-11 sm:h-12 bg-background border-2 focus:border-primary transition-colors text-sm sm:text-base"
              />
              {inputValue.trim() && !isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    <span className="text-xs">↵</span>
                  </kbd>
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              size="lg"
              className="h-11 sm:h-12 px-4 sm:px-6 gradient-primary text-white hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
