import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Zap, Mail, Send, Loader2, Play, Search } from 'lucide-react';

export function EmailAIDemo() {
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const { toast } = useToast();

  const generateSampleEmails = async () => {
    setIsGeneratingEmails(true);
    try {
      const { data, error } = await supabase.functions.invoke('simulate-emails', {
        body: { count: 8 }
      });

      if (error) throw error;

      toast({
        title: 'Sample Emails Generated!',
        description: `${data.emails?.length || 8} realistic emails created and being categorized by AI`,
      });
    } catch (error) {
      console.error('Error generating emails:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate sample emails',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingEmails(false);
    }
  };

  const testAICategorization = async () => {
    setIsCategorizing(true);
    try {
      const testEmail = {
        subject: "Re: Partnership Opportunity - AI Integration",
        body: "Hi there! I'm very interested in exploring a partnership between our companies. We're looking for AI solutions that can enhance our customer experience. Could we schedule a call next week to discuss this further? I'm available Tuesday-Thursday afternoons.",
        fromEmail: "partner@techstartup.com",
        fromName: "Tech Startup CEO"
      };
      
      const { data, error } = await supabase.functions.invoke('categorize-email', {
        body: testEmail
      });

      if (error) throw error;

      toast({
        title: 'AI Categorization Complete!',
        description: `Category: ${data.category} (${Math.round(data.confidence * 100)}% confidence, Priority: ${data.priority.toFixed(2)})`,
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

  const testSuggestedReply = async () => {
    setIsTestingSearch(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-reply', {
        body: {
          emailId: 'test',
          subject: 'Interested in your services',
          body: 'Hi, I saw your company online and I\'m interested in your AI development services. Could you provide more information about your pricing and timeline?',
          fromEmail: 'client@business.com',
          category: 'sales_lead'
        }
      });

      if (error) throw error;

      toast({
        title: 'Reply Generated!',
        description: 'AI has created a professional suggested reply using knowledge base context',
      });
    } catch (error) {
      console.error('Error testing reply generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to test reply generation',
        variant: 'destructive'
      });
    } finally {
      setIsTestingSearch(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          AI Email Aggregator Demo
        </CardTitle>
        <CardDescription>
          Experience the complete email aggregation system with AI categorization, search, and RAG-powered reply suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium">AI Categorization</h3>
            <p className="text-sm text-muted-foreground">Emails classified into interested, meetings, support, etc.</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium">Full-Text Search</h3>
            <p className="text-sm text-muted-foreground">PostgreSQL-powered search across all email content</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium">Smart Replies</h3>
            <p className="text-sm text-muted-foreground">RAG-powered suggested replies using knowledge base</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-medium">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">Live email sync with priority notifications</p>
          </div>
        </div>

        <Separator />

        {/* Demo Actions */}
        <div className="space-y-4">
          <h3 className="font-medium">Try the Email Features:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Generate Sample Emails</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Creates realistic business emails that will be automatically categorized by AI
                  </p>
                  <Button 
                    onClick={generateSampleEmails}
                    disabled={isGeneratingEmails}
                    className="w-full"
                  >
                    {isGeneratingEmails ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Generate 8 Emails
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
                    Test the AI with a sample partnership email
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

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Test Smart Replies</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generate AI-powered reply using knowledge base
                  </p>
                  <Button 
                    onClick={testSuggestedReply}
                    disabled={isTestingSearch}
                    variant="outline"
                    className="w-full"
                  >
                    {isTestingSearch ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Test Reply AI
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
          <Badge variant="secondary">🤖 GPT-5 Email Classification</Badge>
          <Badge variant="secondary">🔍 PostgreSQL Full-Text Search</Badge>
          <Badge variant="secondary">📧 RAG-Powered Replies</Badge>
          <Badge variant="secondary">🔔 Slack Notifications</Badge>
          <Badge variant="secondary">📊 Priority Scoring</Badge>
          <Badge variant="secondary">💬 Sentiment Analysis</Badge>
        </div>
      </CardContent>
    </Card>
  );
}