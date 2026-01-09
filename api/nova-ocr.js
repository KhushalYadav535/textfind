/**
 * Vercel Serverless Function - Proxy for n8n webhook
 * Handles CORS and proxies requests to n8n webhook in production
 */

// Production webhook URL (for Vercel serverless function)
// Note: Make sure this matches the URL in amazonNovaOcrClient.js
// Can be overridden with environment variable NOVA_WEBHOOK_URL
const NOVA_WEBHOOK_URL = process.env.NOVA_WEBHOOK_URL || 'https://n8n.srv980418.hstgr.cloud/webhook/nova-ocr';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Forward the request to n8n webhook
    const response = await fetch(NOVA_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    // Get response text
    const responseText = await response.text();
    
    // Log response details for debugging
    const requestBodySize = JSON.stringify(req.body).length;
    console.log('[Proxy] Request body size:', requestBodySize, 'bytes');
    console.log('[Proxy] Response status:', response.status);
    console.log('[Proxy] Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('[Proxy] Response body length:', responseText?.length || 0);
    
    // Check if response is empty
    if (!responseText || responseText.trim().length === 0) {
      console.error('[Proxy] ⚠️ Empty response from n8n webhook!');
      console.error('[Proxy] Request sent:', requestBodySize, 'bytes');
      console.error('[Proxy] Response received:', responseText?.length || 0, 'bytes');
      console.error('[Proxy] This usually means "Respond to Webhook" node is not configured correctly');
      console.error('[Proxy] The n8n workflow received the request but did not return any data');
    }
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');

    // Forward status and response (even if empty, so client can see the issue)
    res.status(response.status).send(responseText);

  } catch (error) {
    console.error('Proxy error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}
