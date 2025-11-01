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
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? "bg-gradient-secondary" : "bg-gradient-primary"
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      <div className={`flex-1 ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <Card
          className={`p-4 max-w-3xl ${
            isUser
              ? "bg-gradient-secondary text-white"
              : "bg-card border-border"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </Card>

        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-3xl">
            {message.citations.map((citation, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs flex items-center gap-1 bg-accent/50"
              >
                <FileText className="w-3 h-3" />
                {citation.dataset}
              </Badge>
            ))}
          </div>
        )}

        {message.visualizations && (
          <div className="max-w-3xl w-full">
            <DataVisualization data={message.visualizations} />
          </div>
        )}
      </div>
    </div>
  );
};
