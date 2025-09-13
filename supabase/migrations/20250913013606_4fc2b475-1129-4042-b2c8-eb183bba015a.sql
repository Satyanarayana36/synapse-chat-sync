-- Create enum for email providers
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'yahoo', 'imap', 'exchange');

-- Create enum for email categories (AI classification)
CREATE TYPE email_category AS ENUM ('interested', 'meeting_booked', 'not_interested', 'spam', 'out_of_office', 'support', 'sales_lead');

-- Create table for email accounts
CREATE TABLE public.email_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider email_provider NOT NULL,
  email_address TEXT NOT NULL,
  display_name TEXT,
  imap_host TEXT,
  imap_port INTEGER DEFAULT 993,
  imap_secure BOOLEAN DEFAULT true,
  access_token TEXT, -- For OAuth providers
  refresh_token TEXT,
  password_encrypted TEXT, -- For IMAP
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email_address)
);

-- Create table for email folders
CREATE TABLE public.email_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  folder_path TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_id, folder_path)
);

-- Create table for emails
CREATE TABLE public.emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.email_folders(id) ON DELETE SET NULL,
  message_id TEXT NOT NULL, -- IMAP message ID
  subject TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[], -- Array of email addresses
  cc_emails TEXT[],
  bcc_emails TEXT[],
  reply_to TEXT,
  email_body TEXT,
  email_body_html TEXT,
  email_body_plain TEXT,
  category email_category,
  ai_confidence FLOAT,
  sentiment_score FLOAT,
  priority_score FLOAT, -- 0-1 for importance
  is_read BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Full text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(subject, '') || ' ' || 
      COALESCE(from_name, '') || ' ' || 
      COALESCE(from_email, '') || ' ' || 
      COALESCE(email_body_plain, '')
    )
  ) STORED,
  UNIQUE(account_id, message_id)
);

-- Create table for suggested replies
CREATE TABLE public.email_suggested_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  suggested_reply TEXT NOT NULL,
  confidence_score FLOAT,
  context_used TEXT, -- What context from knowledge base was used
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for knowledge base (for RAG)
CREATE TABLE public.knowledge_base_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- product_info, outreach_templates, etc.
  tags TEXT[],
  embedding_summary TEXT, -- Summary for embedding
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for email sync jobs
CREATE TABLE public.email_sync_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  emails_processed INTEGER DEFAULT 0,
  last_message_date TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suggested_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies (for demo, allowing public access)
CREATE POLICY "Allow public access to email_accounts" 
ON public.email_accounts FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to email_folders" 
ON public.email_folders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to emails" 
ON public.emails FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to email_suggested_replies" 
ON public.email_suggested_replies FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to knowledge_base_emails" 
ON public.knowledge_base_emails FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to email_sync_jobs" 
ON public.email_sync_jobs FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_emails_account_id ON public.emails(account_id);
CREATE INDEX idx_emails_folder_id ON public.emails(folder_id);
CREATE INDEX idx_emails_category ON public.emails(category);
CREATE INDEX idx_emails_received_at ON public.emails(received_at DESC);
CREATE INDEX idx_emails_from_email ON public.emails(from_email);
CREATE INDEX idx_emails_is_read ON public.emails(is_read);
CREATE INDEX idx_emails_search ON public.emails USING GIN(search_vector);
CREATE INDEX idx_email_accounts_user_id ON public.email_accounts(user_id);
CREATE INDEX idx_email_folders_account_id ON public.email_folders(account_id);

-- Create triggers for timestamps
CREATE TRIGGER update_email_accounts_updated_at
  BEFORE UPDATE ON public.email_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emails_updated_at
  BEFORE UPDATE ON public.emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_emails_updated_at
  BEFORE UPDATE ON public.knowledge_base_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for emails table
ALTER TABLE public.emails REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.emails;