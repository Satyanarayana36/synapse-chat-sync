import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Zap, MessageSquare, Send, Loader2, Play } from 'lucide-react';

export function AIDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  const generateSimulatedMessages = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-messages', {
        body: { count: 5 }
      });

      if (error) throw error;

      toast({
        title: 'Messages Generated!',
        description: `${data.messages?.length || 5} simulated messages created and being categorized by AI`,
      });
    } catch (error) {
      console.error('Error generating messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate simulated messages',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const testAICategorization = async () => {
    setIsCategorizing(true);
    try {
      const testMessage = "URGENT: Our main server is down and all customers are affected! This needs immediate attention!";
      
      const { data, error } = await supabase.functions.invoke('categorize-message', {
        body: { content: testMessage }
      });

      if (error) throw error;

      toast({
        title: 'AI Categorization Complete!',
        description: `Category: ${data.category} (${Math.round(data.confidence * 100)}% confidence)`,
      });
    } catch (error) {
      console.error('Error testing categorization:', error);
      toast({
        title: 'Error',
        description: 'Failed to test AI categorization',
        variant: 'destructive'
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          AI-Powered Demo Features
        </CardTitle>
        <CardDescription>
          Experience the AI chat aggregator with real-time categorization and webhook integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium">AI Categorization</h3>
            <p className="text-sm text-muted-foreground">Messages automatically classified into support, sales, urgent, etc.</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-medium">Slack Alerts</h3>
            <p className="text-sm text-muted-foreground">Instant notifications for urgent messages and sales leads</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">Live message synchronization across all platforms</p>
          </div>
        </div>

        <Separator />

        {/* Demo Actions */}
        <div className="space-y-4">
          <h3 className="font-medium">Try the Features:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Generate Sample Messages</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Creates realistic messages from different platforms that will be automatically categorized by AI
                  </p>
                  <Button 
                    onClick={generateSimulatedMessages}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Generate 5 Messages
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Test AI Categorization</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Test the AI categorization with a sample urgent message
                  </p>
                  <Button 
                    onClick={testAICategorization}
                    disabled={isCategorizing}
                    variant="outline"
                    className="w-full"
                  >
                    {isCategorizing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        Test AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">✨ GPT-5 Nano Classification</Badge>
          <Badge variant="secondary">🔄 Real-time WebSocket Updates</Badge>
          <Badge variant="secondary">📢 Slack Webhook Integration</Badge>
          <Badge variant="secondary">💻 Multi-platform Support</Badge>
          <Badge variant="secondary">📊 Sentiment Analysis</Badge>
        </div>
      </CardContent>
    </Card>
  );
}