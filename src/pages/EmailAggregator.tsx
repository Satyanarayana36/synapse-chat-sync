import React, { useState, useMemo } from 'react';
import { EmailCard } from '@/components/EmailCard';
import { EmailFilters } from '@/components/EmailFilters';
import { EmailAIDemo } from '@/components/EmailAIDemo';
import { useEmails } from '@/hooks/useEmails';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Bot, Zap, RefreshCw, Plus, Search, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EmailAggregator = () => {
  const { emails, loading, error, addSampleEmails, searchEmails, markAsRead, refetch } = useEmails();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      const matchesCategory = selectedCategory === 'all' || email.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || 
        (selectedPriority === 'high' && email.priority_score && email.priority_score > 0.7) ||
        (selectedPriority === 'medium' && email.priority_score && email.priority_score >= 0.3 && email.priority_score <= 0.7) ||
        (selectedPriority === 'low' && email.priority_score && email.priority_score < 0.3);
      const matchesRead = !showUnreadOnly || !email.is_read;
      const matchesSearch = searchQuery === '' || 
        email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.email_body?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesPriority && matchesRead && matchesSearch;
    });
  }, [emails, selectedCategory, selectedPriority, showUnreadOnly, searchQuery]);

  // Calculate stats
  const emailStats = useMemo(() => ({
    total: emails.length,
    unread: emails.filter(e => !e.is_read).length,
    highPriority: emails.filter(e => e.priority_score && e.priority_score > 0.7).length,
    interested: emails.filter(e => e.category === 'interested').length
  }), [emails]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchEmails(query);
    } else {
      refetch();
    }
  };

  const handleSuggestReply = (emailId: string) => {
    // Mark email as read when reply is suggested
    markAsRead(emailId);
  };

  if (loading && emails.length === 0) {
    return (
      <div className="min-h-screen bg-background">
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
              <Mail className="w-8 h-8 text-primary" />
              AI Email Aggregator
            </h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => addSampleEmails(5)}
                variant="outline" 
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Sample Emails
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
            Multi-platform email aggregator with AI-powered categorization, search, and smart reply suggestions
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="emails" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              Email Dashboard
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Demo Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <EmailAIDemo />
          </TabsContent>

          <TabsContent value="emails" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailStats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unread</CardTitle>
                  <Zap className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{emailStats.unread}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                  <Zap className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{emailStats.highPriority}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interested Leads</CardTitle>
                  <Bot className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{emailStats.interested}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <EmailFilters
              selectedCategory={selectedCategory}
              selectedPriority={selectedPriority}
              searchQuery={searchQuery}
              showUnreadOnly={showUnreadOnly}
              onCategoryChange={setSelectedCategory}
              onPriorityChange={setSelectedPriority}
              onSearchChange={handleSearch}
              onUnreadToggle={() => setShowUnreadOnly(!showUnreadOnly)}
              onRefresh={refetch}
              emailStats={emailStats}
            />

            <Separator />

            {/* Emails */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Emails ({filteredEmails.length})
                </h2>
                {searchQuery && (
                  <Badge variant="secondary">
                    Searched: "{searchQuery}"
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
              
              {filteredEmails.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle className="mb-2">No emails found</CardTitle>
                    <CardDescription>
                      {emails.length === 0 
                        ? "Add sample emails to get started with the email aggregator."
                        : "Try adjusting your filters or search query."
                      }
                    </CardDescription>
                    {emails.length === 0 && (
                      <Button onClick={() => addSampleEmails(8)} className="mt-4">
                        Generate Sample Emails
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredEmails.map((email) => (
                    <EmailCard 
                      key={email.id} 
                      email={email} 
                      onSuggestReply={handleSuggestReply}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailAggregator;