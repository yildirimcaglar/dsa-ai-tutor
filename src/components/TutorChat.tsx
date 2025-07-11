import { useState } from "react";
import { MessageCircle, Send, Bot, User, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'tutor' | 'hint';
  content: string;
  timestamp: Date;
}

interface TutorChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onRequestHint: () => void;
  isTyping?: boolean;
  hintsRemaining?: number;
}

export function TutorChat({ 
  messages, 
  onSendMessage, 
  onRequestHint, 
  isTyping = false,
  hintsRemaining = 2
}: TutorChatProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full max-h-full overflow-hidden">
      <Card className="p-4 bg-gradient-card shadow-card h-full max-h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Tutor</h3>
          </div>
          <Button
            onClick={onRequestHint}
            variant="outline"
            size="sm"
            disabled={hintsRemaining === 0}
            className="bg-accent/20 border-accent/50 hover:bg-accent/30"
          >
            <Lightbulb className="w-4 h-4 mr-1" />
            Hint ({hintsRemaining})
          </Button>
        </div>

        <div className="flex-1 min-h-0 mb-4 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.type === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex max-w-[80%] gap-2",
                      message.type === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.type === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : message.type === 'hint'
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : message.type === 'hint' ? (
                        <Lightbulb className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2",
                        message.type === 'user'
                          ? "bg-primary text-primary-foreground"
                          : message.type === 'hint'
                          ? "bg-accent/30 border border-accent/60 text-accent-foreground"
                          : "bg-secondary text-secondary-foreground border border-border"
                      )}
                    >
                      {message.type === 'hint' && (
                        <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                          Hint
                        </Badge>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 items-end flex-shrink-0">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the current step... (Press Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-background border-border resize-none min-h-[72px] max-h-[120px]"
            rows={3}
          />
          <Button type="submit" disabled={!input.trim()} size="icon" className="mb-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}