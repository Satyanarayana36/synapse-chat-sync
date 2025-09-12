import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Bot, AlertTriangle } from "lucide-react";

type MessageCategory = 'support_request' | 'sales_lead' | 'general_query' | 'spam' | 'urgent';
type ChatPlatform = 'whatsapp' | 'telegram' | 'slack' | 'discord';

interface Message {
  id: string;
  platform: ChatPlatform;
  sender_name: string;
  content: string;
  category: MessageCategory | null;
  ai_confidence: number | null;
  sentiment_score: number | null;
  is_urgent: boolean;
  created_at: string;
}

interface ChatMessageProps {
  message: Message;
}

const platformColors = {
  whatsapp: 'bg-green-500',
  telegram: 'bg-blue-500', 
  slack: 'bg-purple-500',
  discord: 'bg-indigo-500'
};

const categoryColors = {
  support_request: 'bg-orange-100 text-orange-800 border-orange-200',
  sales_lead: 'bg-green-100 text-green-800 border-green-200',
  general_query: 'bg-blue-100 text-blue-800 border-blue-200', 
  spam: 'bg-red-100 text-red-800 border-red-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
};

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPlatformIcon = (platform: ChatPlatform) => {
    return <MessageCircle className="w-4 h-4" />;
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <div className={`w-full h-full flex items-center justify-center text-white ${platformColors[message.platform]}`}>
              {getPlatformIcon(message.platform)}
            </div>
            <AvatarFallback>{message.platform[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{message.sender_name}</span>
                <Badge variant="secondary" className="text-xs">
                  {message.platform}
                </Badge>
                {message.is_urgent && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Urgent
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
            </div>
            
            <p className="text-foreground">{message.content}</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {message.category && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${categoryColors[message.category]}`}
                >
                  <Bot className="w-3 h-3 mr-1" />
                  {message.category.replace('_', ' ')}
                </Badge>
              )}
              {message.ai_confidence && (
                <span className="text-xs text-muted-foreground">
                  AI Confidence: {Math.round(message.ai_confidence * 100)}%
                </span>
              )}
              {message.sentiment_score !== null && (
                <span className="text-xs text-muted-foreground">
                  Sentiment: {message.sentiment_score > 0 ? '😊' : message.sentiment_score < -0.3 ? '😟' : '😐'}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}