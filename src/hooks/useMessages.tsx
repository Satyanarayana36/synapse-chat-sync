import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type MessageCategory = 'support_request' | 'sales_lead' | 'general_query' | 'spam' | 'urgent';
type ChatPlatform = 'whatsapp' | 'telegram' | 'slack' | 'discord';

interface Message {
  id: string;
  platform: ChatPlatform;
  platform_message_id: string;
  sender_id: string;
  sender_name: string | null;
  content: string;
  category: MessageCategory | null;
  ai_confidence: number | null;
  sentiment_score: number | null;
  is_urgent: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Message Added',
        description: 'New message has been added successfully'
      });
      
      return data;
    } catch (err) {
      console.error('Error adding message:', err);
      toast({
        title: 'Error',
        description: 'Failed to add message',
        variant: 'destructive'
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload.new);
          setMessages(prev => [payload.new as Message, ...prev]);
          
          // Show toast for new urgent messages
          if ((payload.new as Message).is_urgent) {
            toast({
              title: 'Urgent Message Received!',
              description: `New urgent message from ${(payload.new as Message).sender_name}`,
              variant: 'destructive'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return {
    messages,
    loading,
    error,
    addMessage,
    refetch: fetchMessages
  };
}