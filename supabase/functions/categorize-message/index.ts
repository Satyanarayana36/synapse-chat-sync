import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, messageId } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    console.log('Categorizing message:', content);

    // Call OpenAI API for message categorization
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an AI message categorizer for a customer service system. 
            
            Analyze the given message and classify it into one of these categories:
            - support_request: Customer needs help with a product/service
            - sales_lead: Customer is interested in purchasing or learning about products
            - general_query: General questions or information requests
            - spam: Promotional, irrelevant, or unwanted messages
            - urgent: Critical issues that need immediate attention
            
            Also provide:
            - confidence score (0-1)
            - sentiment score (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive)
            - whether the message is urgent (boolean)
            
            Respond with a JSON object like:
            {
              "category": "support_request",
              "confidence": 0.85,
              "sentiment": -0.2,
              "is_urgent": false,
              "reasoning": "Customer is asking for help with their order"
            }`
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_completion_tokens: 200,
      }),
    });

    const aiData = await response.json();
    console.log('OpenAI response:', aiData);

    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResult = JSON.parse(aiData.choices[0].message.content);
    console.log('Parsed AI result:', aiResult);

    // Update message in database if messageId provided
    if (messageId) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          category: aiResult.category,
          ai_confidence: aiResult.confidence,
          sentiment_score: aiResult.sentiment,
          is_urgent: aiResult.is_urgent
        })
        .eq('id', messageId);

      if (updateError) {
        console.error('Error updating message:', updateError);
      } else {
        console.log('Message updated successfully');
      }
    }

    // Send webhook for urgent messages or sales leads
    if (aiResult.is_urgent || aiResult.category === 'sales_lead') {
      EdgeRuntime.waitUntil(sendWebhook(aiResult, content, messageId));
    }

    return new Response(
      JSON.stringify({
        category: aiResult.category,
        confidence: aiResult.confidence,
        sentiment: aiResult.sentiment,
        is_urgent: aiResult.is_urgent,
        reasoning: aiResult.reasoning
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in categorize-message function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendWebhook(aiResult: any, content: string, messageId: string) {
  try {
    const webhookUrl = 'https://webhook.site/unique-url-here'; // Replace with actual webhook URL
    
    const webhookPayload = {
      type: aiResult.is_urgent ? 'urgent_message' : 'sales_lead',
      messageId,
      content,
      category: aiResult.category,
      confidence: aiResult.confidence,
      sentiment: aiResult.sentiment,
      timestamp: new Date().toISOString()
    };

    console.log('Sending webhook:', webhookPayload);

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log('Webhook sent successfully');
  } catch (error) {
    console.error('Error sending webhook:', error);
  }
}