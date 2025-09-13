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
    const { count = 1 } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const sampleMessages = [
      {
        platform: 'whatsapp',
        sender_name: 'Alice Johnson',
        content: 'Hi! My order #12345 hasn\'t arrived yet. Can you please check the status?',
        expected_category: 'support_request'
      },
      {
        platform: 'telegram',
        sender_name: 'Bob Smith',
        content: 'URGENT: Our website is completely down! All our customers are complaining!',
        expected_category: 'urgent'
      },
      {
        platform: 'slack',
        sender_name: 'Carol Williams',
        content: 'I\'m interested in your enterprise plan. Can we schedule a demo this week?',
        expected_category: 'sales_lead'
      },
      {
        platform: 'discord',
        sender_name: 'David Brown',
        content: 'What are your business hours? I need to contact support.',
        expected_category: 'general_query'
      },
      {
        platform: 'whatsapp',
        sender_name: 'Eve Davis',
        content: 'FREE CRYPTO! Click here to get 1000$ in Bitcoin!!! Limited time offer!!!',
        expected_category: 'spam'
      },
      {
        platform: 'telegram',
        sender_name: 'Frank Miller',
        content: 'Our payment system is failing! We\'re losing thousands of dollars per minute!',
        expected_category: 'urgent'
      },
      {
        platform: 'slack',
        sender_name: 'Grace Wilson',
        content: 'We\'d like to upgrade from Basic to Pro plan. What\'s the process?',
        expected_category: 'sales_lead'
      },
      {
        platform: 'discord',
        sender_name: 'Henry Taylor',
        content: 'How do I reset my password? I can\'t log into my account.',
        expected_category: 'support_request'
      }
    ];

    const messagesToCreate = [];
    
    for (let i = 0; i < count; i++) {
      const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      
      messagesToCreate.push({
        platform: randomMessage.platform,
        platform_message_id: `sim_${Date.now()}_${i}`,
        sender_id: `user_${Math.floor(Math.random() * 1000)}`,
        sender_name: randomMessage.sender_name,
        content: randomMessage.content,
        category: null, // Will be set by AI
        ai_confidence: null,
        sentiment_score: null,
        is_urgent: false,
        metadata: { simulated: true, expected_category: randomMessage.expected_category }
      });
    }

    // Insert messages into database
    const { data: insertedMessages, error } = await supabase
      .from('messages')
      .insert(messagesToCreate)
      .select();

    if (error) {
      throw error;
    }

    console.log(`${insertedMessages.length} simulated messages created`);

    // Categorize each message using AI
    for (const message of insertedMessages) {
      EdgeRuntime.waitUntil(categorizeMessage(message));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${insertedMessages.length} simulated messages created and being categorized`,
        messages: insertedMessages
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating simulated messages:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function categorizeMessage(message: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Call the categorize-message function
    const response = await fetch(`${supabaseUrl}/functions/v1/categorize-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message.content,
        messageId: message.id
      })
    });

    if (!response.ok) {
      console.error('Failed to categorize message:', await response.text());
    } else {
      console.log('Message categorized successfully:', message.id);
      
      // Check if message is urgent and send Slack notification
      const result = await response.json();
      if (result.is_urgent) {
        await fetch(`${supabaseUrl}/functions/v1/slack-notification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: message.content,
            senderName: message.sender_name,
            platform: message.platform,
            messageId: message.id
          })
        });
      }
    }
  } catch (error) {
    console.error('Error in background categorization:', error);
  }
}