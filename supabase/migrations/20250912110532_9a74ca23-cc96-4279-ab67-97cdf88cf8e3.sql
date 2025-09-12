-- Create enum for chat platforms
CREATE TYPE chat_platform AS ENUM ('whatsapp', 'telegram', 'slack', 'discord');

-- Create enum for message categories  
CREATE TYPE message_category AS ENUM ('support_request', 'sales_lead', 'general_query', 'spam', 'urgent');

-- Create table for chat platforms configuration
CREATE TABLE public.chat_platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name chat_platform NOT NULL UNIQUE,
  api_key TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform chat_platform NOT NULL,
  platform_message_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT,
  content TEXT NOT NULL,
  category message_category,
  ai_confidence FLOAT,
  sentiment_score FLOAT,
  is_urgent BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform, platform_message_id)
);

-- Create table for suggested replies
CREATE TABLE public.suggested_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  suggested_text TEXT NOT NULL,
  confidence_score FLOAT,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for FAQs/Knowledge base
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for demo purposes)
CREATE POLICY "Allow public read access to chat_platforms" 
ON public.chat_platforms FOR SELECT USING (true);

CREATE POLICY "Allow public insert to chat_platforms" 
ON public.chat_platforms FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to chat_platforms" 
ON public.chat_platforms FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to messages" 
ON public.messages FOR SELECT USING (true);

CREATE POLICY "Allow public insert to messages" 
ON public.messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to messages" 
ON public.messages FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to suggested_replies" 
ON public.suggested_replies FOR SELECT USING (true);

CREATE POLICY "Allow public insert to suggested_replies" 
ON public.suggested_replies FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to knowledge_base" 
ON public.knowledge_base FOR SELECT USING (true);

CREATE POLICY "Allow public insert to knowledge_base" 
ON public.knowledge_base FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to knowledge_base" 
ON public.knowledge_base FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_chat_platforms_updated_at
  BEFORE UPDATE ON public.chat_platforms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_messages_platform ON public.messages(platform);
CREATE INDEX idx_messages_category ON public.messages(category);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_suggested_replies_message_id ON public.suggested_replies(message_id);

-- Enable realtime for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.messages;