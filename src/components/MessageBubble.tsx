import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Bot } from "lucide-react";
import { Message } from "./ChatInterface";
import { DataVisualization } from "./DataVisualization";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in group w-full`}>
      <div
        className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
          isUser 
            ? "gradient-secondary" 
            : "gradient-primary"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col gap-2 sm:gap-3 min-w-0 max-w-[85%] sm:max-w-3xl`}>
        <Card
          className={`p-3 sm:p-4 md:p-5 shadow-md transition-all w-full ${
            isUser
              ? "gradient-secondary text-white border-0 shadow-lg"
              : "bg-card border-2 border-border/50 hover:border-primary/30 hover:shadow-lg"
          }`}
        >
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </Card>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full">
            <span className="text-xs text-muted-foreground font-medium w-full mb-1">Sources:</span>
            {message.citations.map((citation, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs flex items-center gap-1.5 bg-accent/80 hover:bg-accent border-primary/30 hover:border-primary/50 transition-colors px-2 py-1"
              >
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium truncate max-w-[200px] sm:max-w-none">{citation.dataset}</span>
              </Badge>
            ))}
          </div>
        )}

        {message.visualizations && (
          <div className="w-full mt-1">
            <DataVisualization data={message.visualizations} />
          </div>
        )}
      </div>
    </div>
  );
};
