import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type EmailCategory = 'interested' | 'meeting_booked' | 'not_interested' | 'spam' | 'out_of_office' | 'support' | 'sales_lead';

interface Email {
  id: string;
  account_id: string;
  message_id: string;
  subject: string | null;
  from_email: string;
  from_name: string | null;
  to_emails: string[] | null;
  email_body: string | null;
  category: EmailCategory | null;
  ai_confidence: number | null;
  sentiment_score: number | null;
  priority_score: number | null;
  is_read: boolean;
  is_flagged: boolean;
  has_attachments: boolean;
  received_at: string;
  created_at: string;
  updated_at: string;
}

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmails(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to fetch emails');
      toast({
        title: 'Error',
        description: 'Failed to fetch emails',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleEmails = async (count: number = 10) => {
    try {
      const { data, error } = await supabase.functions.invoke('simulate-emails', {
        body: { count }
      });

      if (error) throw error;
      
      toast({
        title: 'Sample Emails Added',
        description: `${count} sample emails have been created and are being categorized by AI`
      });
      
      // Refresh emails after a short delay to allow AI categorization
      setTimeout(() => {
        fetchEmails();
      }, 2000);
      
      return data;
    } catch (err) {
      console.error('Error adding sample emails:', err);
      toast({
        title: 'Error',
        description: 'Failed to add sample emails',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const searchEmails = async (query: string) => {
    try {
      setLoading(true);
      
      // Use Postgres full-text search
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .or(`subject.ilike.%${query}%,from_name.ilike.%${query}%,from_email.ilike.%${query}%,email_body.ilike.%${query}%`)
        .order('received_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmails(data || []);
    } catch (err) {
      console.error('Error searching emails:', err);
      setError('Failed to search emails');
      toast({
        title: 'Error',
        description: 'Failed to search emails',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);

      if (error) throw error;
      
      // Update local state
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, is_read: true } : email
      ));
    } catch (err) {
      console.error('Error marking email as read:', err);
    }
  };

  const toggleFlag = async (emailId: string) => {
    try {
      const email = emails.find(e => e.id === emailId);
      if (!email) return;

      const { error } = await supabase
        .from('emails')
        .update({ is_flagged: !email.is_flagged })
        .eq('id', emailId);

      if (error) throw error;
      
      // Update local state
      setEmails(prev => prev.map(e => 
        e.id === emailId ? { ...e, is_flagged: !e.is_flagged } : e
      ));
    } catch (err) {
      console.error('Error toggling flag:', err);
    }
  };

  useEffect(() => {
    fetchEmails();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails'
        },
        (payload) => {
          console.log('New email:', payload.new);
          setEmails(prev => [payload.new as Email, ...prev]);
          
          // Show toast for high-priority emails
          const newEmail = payload.new as Email;
          if (newEmail.priority_score && newEmail.priority_score > 0.7) {
            toast({
              title: 'High Priority Email!',
              description: `New high-priority email from ${newEmail.from_name || newEmail.from_email}`,
              variant: 'destructive'
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emails'
        },
        (payload) => {
          console.log('Email updated:', payload.new);
          setEmails(prev => prev.map(email => 
            email.id === (payload.new as Email).id ? payload.new as Email : email
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    emails,
    loading,
    error,
    addSampleEmails,
    searchEmails,
    markAsRead,
    toggleFlag,
    refetch: fetchEmails
  };
}