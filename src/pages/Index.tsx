import React, { useState, useMemo } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageFilters } from '@/components/MessageFilters';
import { AIDemo } from '@/components/AIDemo';
import { useMessages } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, Zap, RefreshCw, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { messages, loading, error, addMessage, refetch } = useMessages();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data generator for demo purposes
  const addSampleMessage = async () => {
    const sampleMessages = [
      {
        platform: 'whatsapp' as const,
        platform_message_id: `wa_${Date.now()}`,
        sender_id: 'user_123',
        sender_name: 'John Doe',
        content: 'Hi, I need help with my recent order. It hasn\'t arrived yet.',
        category: 'support_request' as const,
        ai_confidence: 0.87,
        sentiment_score: -0.2,
        is_urgent: false,
        metadata: {}
      },
      {
        platform: 'telegram' as const,
        platform_message_id: `tg_${Date.now()}`,
        sender_id: 'user_456',
        sender_name: 'Sarah Smith',
        content: 'URGENT: System is down! Our customers can\'t access the platform!',
        category: 'urgent' as const,
        ai_confidence: 0.95,
        sentiment_score: -0.8,
        is_urgent: true,
        metadata: {}
      },
      {
        platform: 'slack' as const,
        platform_message_id: `sl_${Date.now()}`,
        sender_id: 'user_789',
        sender_name: 'Mike Johnson',
        content: 'I\'m interested in your enterprise plan. Can we schedule a demo?',
        category: 'sales_lead' as const,
        ai_confidence: 0.92,
        sentiment_score: 0.6,
        is_urgent: false,
        metadata: {}
      }
    ];
    
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    await addMessage(randomMessage);
  };

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesPlatform = selectedPlatform === 'all' || message.platform === selectedPlatform;
      const matchesCategory = selectedCategory === 'all' || message.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesPlatform && matchesCategory && matchesSearch;
    });
  }, [messages, selectedPlatform, selectedCategory, searchQuery]);

  // Calculate stats
  const messageStats = useMemo(() => ({
    total: messages.length,
    urgent: messages.filter(m => m.is_urgent).length,
    salesLeads: messages.filter(m => m.category === 'sales_lead').length
  }), [messages]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              AI Chat Aggregator
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={addSampleMessage}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Sample Message
              </Button>
              <Button 
                onClick={refetch}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Multi-channel chat aggregator with AI-powered categorization and real-time updates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messageStats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Messages</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{messageStats.urgent}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Leads</CardTitle>
              <Bot className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{messageStats.salesLeads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Platforms</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Demo Section */}
        <AIDemo />

        {/* Filters */}
        <MessageFilters
          selectedPlatform={selectedPlatform}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onPlatformChange={setSelectedPlatform}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchQuery}
          messageStats={messageStats}
        />

        <Separator />

        {/* Messages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Messages ({filteredMessages.length})
            </h2>
            {searchQuery && (
              <Badge variant="secondary">
                Filtered by: "{searchQuery}"
              </Badge>
            )}
          </div>
          
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-800">{error}</p>
              </CardContent>
            </Card>
          )}
          
          {filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="mb-2">No messages found</CardTitle>
                <CardDescription>
                  {messages.length === 0 
                    ? "Add sample messages to get started with the chat aggregator."
                    : "Try adjusting your filters or search query."
                  }
                </CardDescription>
                {messages.length === 0 && (
                  <Button onClick={addSampleMessage} className="mt-4">
                    Add Sample Messages
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
