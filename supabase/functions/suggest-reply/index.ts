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
    const { emailId, subject, body, fromEmail, category } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log('Generating suggested reply for email:', emailId);

    // Get knowledge base context
    const { data: knowledgeBase } = await supabase
      .from('knowledge_base_emails')
      .select('*')
      .limit(5);

    const contextText = knowledgeBase?.map(kb => `${kb.title}: ${kb.content}`).join('\n\n') || '';

    // Generate suggested reply using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are a professional email assistant helping with recruitment and business communications.

            Generate a professional, contextual reply to the incoming email based on:
            1. The email content and category
            2. The available knowledge base context
            3. Best practices for professional communication

            Knowledge Base Context:
            ${contextText}

            Guidelines:
            - Keep replies concise and professional
            - For "interested" emails: acknowledge interest and suggest next steps
            - For "meeting_booked": confirm details and provide any needed information
            - For "sales_lead": provide helpful information and suggest a call/meeting
            - For "support": offer helpful guidance or escalation
            - Include relevant links or contact information when appropriate
            - Match the tone of the incoming email

            Format as a complete email reply that can be copied and sent.`
          },
          {
            role: 'user',
            content: `Category: ${category}
Subject: ${subject}
From: ${fromEmail}

Email Content:
${body}

Please generate a suggested reply:`
          }
        ],
        max_completion_tokens: 500,
      }),
    });

    const aiData = await response.json();
    console.log('Reply generation completed');

    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const suggestedReply = aiData.choices[0].message.content;

    // Save suggested reply to database
    const { data: savedReply, error } = await supabase
      .from('email_suggested_replies')
      .insert({
        email_id: emailId,
        suggested_reply: suggestedReply,
        confidence_score: 0.85, // Could be calculated based on context match
        context_used: contextText.substring(0, 500) // First 500 chars of context used
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving suggested reply:', error);
    }

    return new Response(
      JSON.stringify({
        suggested_reply: suggestedReply,
        context_used: contextText !== '',
        reply_id: savedReply?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-reply function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});