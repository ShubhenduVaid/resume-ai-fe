import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  type: 'user' | 'system';
}

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollArea className="h-full p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.type === 'user'
                ? 'bg-primary text-primary-foreground ml-4'
                : 'bg-muted mr-4'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={message.type === 'user' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {message.type === 'user' ? 'You' : 'AI Assistant'}
              </Badge>
              <span className="text-xs opacity-70">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{message.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No chat history yet.</p>
            <p className="text-xs mt-1">
              Start by asking me to update your resume!
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
