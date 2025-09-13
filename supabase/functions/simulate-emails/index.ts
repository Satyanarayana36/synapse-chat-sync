import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 10 } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Sample email data that mimics real recruitment/business emails
    const sampleEmails = [
      {
        provider: 'gmail',
        subject: 'Re: Software Engineer Position - Next Steps',
        from_email: 'john.developer@techcorp.com',
        from_name: 'John Developer',
        body: 'Hi there! Thank you for reaching out about the Software Engineer position. I\'m very interested and would love to discuss this opportunity further. When would be a good time for a call? I\'m available most weekdays after 2 PM EST.',
        expected_category: 'interested'
      },
      {
        provider: 'outlook',
        subject: 'Meeting Confirmed - Technical Interview Tomorrow',
        from_email: 'sarah.candidate@email.com',
        from_name: 'Sarah Candidate',
        body: 'Perfect! I have our technical interview scheduled for tomorrow at 3 PM EST. I\'ll join the Zoom call from the link you provided. Looking forward to discussing the role and demonstrating my coding skills.',
        expected_category: 'meeting_booked'
      },
      {
        provider: 'gmail',
        subject: 'Thank you for the opportunity',
        from_email: 'mike.designer@creative.io',
        from_name: 'Mike Designer',
        body: 'Thank you for considering me for the UX Designer position. After careful consideration, I\'ve decided to pursue another opportunity that aligns better with my current career goals. I wish you the best in finding the right candidate.',
        expected_category: 'not_interested'
      },
      {
        provider: 'outlook',
        subject: 'URGENT: System Integration Issue',
        from_email: 'client.support@businesscorp.com',
        from_name: 'Business Corp Support',
        body: 'We\'re experiencing critical issues with the API integration you provided. Our production system is failing to authenticate and we\'re losing data. This needs immediate attention as it\'s affecting our operations.',
        expected_category: 'support'
      },
      {
        provider: 'gmail',
        subject: 'Inquiry about Enterprise Development Services',
        from_email: 'cto@startup.tech',
        from_name: 'Tech Startup CTO',
        body: 'Hello! We\'re a growing startup looking for development services to build our MVP. We need a team that can handle both frontend and backend development. Can we schedule a call to discuss our requirements and your pricing?',
        expected_category: 'sales_lead'
      },
      {
        provider: 'outlook',
        subject: 'Out of Office: Vacation until next week',
        from_email: 'auto-reply@company.com',
        from_name: 'Auto Reply System',
        body: 'Thank you for your email. I am currently out of office on vacation and will return on Monday, January 15th. For urgent matters, please contact my colleague at emergency@company.com. I will respond to your email upon my return.',
        expected_category: 'out_of_office'
      },
      {
        provider: 'gmail',
        subject: '🚀 EXCLUSIVE OFFER: 90% OFF Premium Tools!',
        from_email: 'noreply@spamtools.biz',
        from_name: 'Marketing Team',
        body: 'LIMITED TIME ONLY! Get 90% off our premium development tools! Click here NOW to claim your discount before it expires! This offer won\'t last long! Act fast and transform your development workflow today!!!',
        expected_category: 'spam'
      },
      {
        provider: 'outlook',
        subject: 'Partnership Opportunity - AI Integration',
        from_email: 'partnerships@aicompany.com',
        from_name: 'AI Company Partnerships',
        body: 'We\'ve been following your work and are impressed with your AI implementations. We\'d like to explore a potential partnership where we could integrate our ML models with your platform. This could be mutually beneficial for both companies.',
        expected_category: 'interested'
      }
    ];

    // First, create a sample email account if it doesn't exist
    const { data: existingAccount } = await supabase
      .from('email_accounts')
      .select('id')
      .eq('email_address', 'demo@yourcompany.com')
      .single();

    let accountId = existingAccount?.id;

    if (!accountId) {
      const { data: newAccount, error: accountError } = await supabase
        .from('email_accounts')
        .insert({
          provider: 'gmail',
          email_address: 'demo@yourcompany.com',
          display_name: 'Demo Account',
          is_active: true
        })
        .select('id')
        .single();

      if (accountError) throw accountError;
      accountId = newAccount.id;
    }

    const emailsToCreate = [];
    
    for (let i = 0; i < count; i++) {
      const randomEmail = sampleEmails[Math.floor(Math.random() * sampleEmails.length)];
      const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
      const receivedAt = new Date();
      receivedAt.setDate(receivedAt.getDate() - daysAgo);
      
      emailsToCreate.push({
        account_id: accountId,
        message_id: `demo_${Date.now()}_${i}`,
        subject: randomEmail.subject,
        from_email: randomEmail.from_email,
        from_name: randomEmail.from_name,
        to_emails: ['demo@yourcompany.com'],
        email_body: randomEmail.body,
        email_body_plain: randomEmail.body,
        received_at: receivedAt.toISOString(),
        is_read: Math.random() > 0.3, // 70% read, 30% unread
        has_attachments: Math.random() > 0.8, // 20% have attachments
        priority_score: Math.random()
      });
    }

    // Insert emails into database
    const { data: insertedEmails, error } = await supabase
      .from('emails')
      .insert(emailsToCreate)
      .select();

    if (error) {
      throw error;
    }

    console.log(`${insertedEmails.length} sample emails created`);

    // Categorize each email using AI (background process)
    for (const email of insertedEmails) {
      EdgeRuntime.waitUntil(categorizeEmail(email));
    }

    // Add some knowledge base entries if they don't exist
    const { data: existingKB } = await supabase
      .from('knowledge_base_emails')
      .select('id')
      .limit(1);

    if (!existingKB || existingKB.length === 0) {
      await supabase.from('knowledge_base_emails').insert([
        {
          title: 'Company Information',
          content: 'We are a leading software development company specializing in AI-powered solutions. Founded in 2020, we help businesses transform through technology.',
          category: 'company_info',
          tags: ['company', 'about', 'services']
        },
        {
          title: 'Interview Process',
          content: 'Our interview process consists of: 1) Initial screening call (30 min), 2) Technical interview (60 min), 3) Final interview with team lead (45 min). We typically complete the process within one week.',
          category: 'recruitment',
          tags: ['interview', 'process', 'hiring']
        },
        {
          title: 'Meeting Booking',
          content: 'To schedule a meeting, please use our Calendly link: calendly.com/yourcompany/meeting. For urgent matters, you can reach us at +1-555-0123.',
          category: 'scheduling',
          tags: ['meeting', 'calendar', 'booking']
        },
        {
          title: 'Support Contact',
          content: 'For technical support, please email support@yourcompany.com or call our 24/7 helpline at +1-555-HELP. Critical issues will be addressed within 2 hours.',
          category: 'support',
          tags: ['support', 'help', 'contact']
        }
      ]);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedEmails.length} sample emails created and being categorized`,
        emails: insertedEmails,
        account_id: accountId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating sample emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function categorizeEmail(email: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Call the categorize-email function
    const response = await fetch(`${supabaseUrl}/functions/v1/categorize-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: email.subject,
        body: email.email_body,
        fromEmail: email.from_email,
        fromName: email.from_name
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update email with AI categorization
      const supabase = createClient(supabaseUrl!, supabaseKey!);
      await supabase
        .from('emails')
        .update({
          category: result.category,
          ai_confidence: result.confidence,
          sentiment_score: result.sentiment,
          priority_score: result.priority
        })
        .eq('id', email.id);

      console.log('Email categorized successfully:', email.id);
      
      // Send Slack notification for high-priority emails
      if (result.priority > 0.7 || result.needs_attention) {
        await fetch(`${supabaseUrl}/functions/v1/slack-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: `High-priority email: ${email.subject}`,
            senderName: email.from_name,
            platform: 'email',
            messageId: email.id
          })
        });
      }
    }
  } catch (error) {
    console.error('Error in background email categorization:', error);
  }
}