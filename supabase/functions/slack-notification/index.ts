import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { content, senderName, platform, messageId } = await req.json();

    // For demo purposes, we'll use a webhook.site URL
    // In production, you would use a real Slack webhook URL
    const slackWebhookUrl = 'https://webhook.site/slack-demo'; // Replace with actual Slack webhook

    const slackPayload = {
      text: `🚨 URGENT MESSAGE ALERT`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚨 Urgent Message Received"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Platform:* ${platform.toUpperCase()}`
            },
            {
              type: "mrkdwn",
              text: `*Sender:* ${senderName}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n${content}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Message ID: ${messageId} | Time: ${new Date().toLocaleString()}`
            }
          ]
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View in Dashboard"
              },
              style: "primary",
              url: `https://your-app.lovable.app/?messageId=${messageId}`
            }
          ]
        }
      ]
    };

    console.log('Sending Slack notification:', slackPayload);

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    console.log('Slack notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Slack notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});