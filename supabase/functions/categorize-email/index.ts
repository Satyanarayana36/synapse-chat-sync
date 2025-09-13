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
    const { subject, body, fromEmail, fromName, category } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Categorizing email:', { subject, fromEmail });

    // Call OpenAI API for email categorization
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an AI email categorizer for a recruitment/business system. 
            
            Analyze the given email and classify it into one of these categories:
            - interested: Someone expressing interest in opportunities, partnerships, or services
            - meeting_booked: Confirms a scheduled meeting, interview, or call
            - not_interested: Politely declining or expressing lack of interest
            - spam: Promotional, irrelevant, or automated marketing emails
            - out_of_office: Auto-reply messages for vacation/absence
            - support: Technical help, questions about services, or customer support
            - sales_lead: Potential customer inquiring about products/services
            
            Also provide:
            - confidence score (0-1)
            - sentiment score (-1 to 1, negative/neutral/positive)
            - priority score (0-1, higher for urgent/important emails)
            - whether this needs immediate attention
            
            Consider the sender's name, email domain, subject line, and body content.
            
            Respond with a JSON object like:
            {
              "category": "interested",
              "confidence": 0.92,
              "sentiment": 0.6,
              "priority": 0.8,
              "needs_attention": true,
              "reasoning": "Person is expressing interest in job opportunities and asking for next steps"
            }`
          },
          {
            role: 'user',
            content: `Subject: ${subject}\nFrom: ${fromName} <${fromEmail}>\n\nBody:\n${body}`
          }
        ],
        max_completion_tokens: 300,
      }),
    });

    const aiData = await response.json();
    console.log('OpenAI response received');

    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResult = JSON.parse(aiData.choices[0].message.content);
    console.log('AI categorization result:', aiResult);

    return new Response(
      JSON.stringify({
        category: aiResult.category,
        confidence: aiResult.confidence,
        sentiment: aiResult.sentiment,
        priority: aiResult.priority || 0.5,
        needs_attention: aiResult.needs_attention || false,
        reasoning: aiResult.reasoning
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in categorize-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});