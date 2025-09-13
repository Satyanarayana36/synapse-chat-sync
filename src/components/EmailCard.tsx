import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Reply, Star, Paperclip, Bot, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EmailCategory = 'interested' | 'meeting_booked' | 'not_interested' | 'spam' | 'out_of_office' | 'support' | 'sales_lead';

interface Email {
  id: string;
  subject: string;
  from_email: string;
  from_name: string | null;
  email_body: string;
  category: EmailCategory | null;
  ai_confidence: number | null;
  sentiment_score: number | null;
  priority_score: number | null;
  is_read: boolean;
  is_flagged: boolean;
  has_attachments: boolean;
  received_at: string;
}

interface EmailCardProps {
  email: Email;
  onSuggestReply?: (emailId: string) => void;
}

const categoryColors = {
  interested: 'bg-green-100 text-green-800 border-green-200',
  meeting_booked: 'bg-blue-100 text-blue-800 border-blue-200',
  not_interested: 'bg-gray-100 text-gray-800 border-gray-200',
  spam: 'bg-red-100 text-red-800 border-red-200',
  out_of_office: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  support: 'bg-purple-100 text-purple-800 border-purple-200',
  sales_lead: 'bg-orange-100 text-orange-800 border-orange-200'
};

const priorityColors = {
  low: 'text-gray-500',
  medium: 'text-yellow-500',
  high: 'text-red-500'
};

export function EmailCard({ email, onSuggestReply }: EmailCardProps) {
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const { toast } = useToast();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getPriorityLevel = (score: number | null) => {
    if (!score) return 'medium';
    if (score > 0.7) return 'high';
    if (score < 0.3) return 'low';
    return 'medium';
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  const truncateBody = (body: string, maxLength = 150) => {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength) + '...';
  };

  const handleSuggestReply = async () => {
    if (!onSuggestReply) return;
    
    setIsGeneratingReply(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-reply', {
        body: {
          emailId: email.id,
          subject: email.subject,
          body: email.email_body,
          fromEmail: email.from_email,
          category: email.category
        }
      });

      if (error) throw error;

      toast({
        title: 'Reply Suggested!',
        description: 'AI has generated a suggested reply for this email.',
      });

      onSuggestReply(email.id);
    } catch (error) {
      console.error('Error generating reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate suggested reply',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const priorityLevel = getPriorityLevel(email.priority_score);

  return (
    <Card className={`mb-4 hover:shadow-md transition-shadow ${!email.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
              {getInitials(email.from_name, email.from_email)}
            </div>
            <AvatarFallback>{getInitials(email.from_name, email.from_email)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {email.from_name || email.from_email}
                </span>
                {!email.is_read && (
                  <Badge variant="secondary" className="text-xs">New</Badge>
                )}
                {email.is_flagged && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                {email.has_attachments && (
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                )}
                {priorityLevel === 'high' && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(email.received_at)}
              </span>
            </div>
            
            <div>
              <h3 className="font-medium text-foreground mb-1">{email.subject}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {truncateBody(email.email_body)}
              </p>
            </div>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {email.category && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${categoryColors[email.category]}`}
                  >
                    <Bot className="w-3 h-3 mr-1" />
                    {email.category.replace('_', ' ')}
                  </Badge>
                )}
                {email.ai_confidence && (
                  <span className="text-xs text-muted-foreground">
                    AI: {Math.round(email.ai_confidence * 100)}%
                  </span>
                )}
                {email.sentiment_score !== null && (
                  <span className="text-xs text-muted-foreground">
                    {email.sentiment_score > 0.3 ? '😊' : email.sentiment_score < -0.3 ? '😟' : '😐'}
                  </span>
                )}
                {email.priority_score !== null && (
                  <span className={`text-xs ${priorityColors[priorityLevel]}`}>
                    Priority: {priorityLevel}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestReply}
                  disabled={isGeneratingReply}
                  className="text-xs"
                >
                  {isGeneratingReply ? (
                    <Bot className="w-3 h-3 mr-1 animate-pulse" />
                  ) : (
                    <Reply className="w-3 h-3 mr-1" />
                  )}
                  {isGeneratingReply ? 'Generating...' : 'Suggest Reply'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}