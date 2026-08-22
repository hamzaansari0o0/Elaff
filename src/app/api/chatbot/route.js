import { NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.N8N_CHATBOT_WEBHOOK_URL;

// n8n AI Agent responses vary by node config (output/text/answer/etc, sometimes
// wrapped in an array) — dig through the common shapes to find the actual reply text.
// The connection to n8n's Cloudflare edge occasionally stalls on the first attempt —
// one retry clears it without masking a genuinely dead webhook.
async function fetchWithRetry(url, options, retries = 1) {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) return fetchWithRetry(url, options, retries - 1);
    throw err;
  }
}

function extractReplyText(data) {
  if (data == null) return "Sorry, I didn't get a response. Please try again.";
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) return data.length ? extractReplyText(data[0]) : '';
  if (typeof data === 'object') {
    const value = data.output ?? data.text ?? data.reply ?? data.answer ?? data.response ?? data.message;
    if (value !== undefined) return extractReplyText(value);
    return JSON.stringify(data);
  }
  return String(data);
}

// Proxies chat messages to the n8n webhook server-side, so the webhook URL never
// ships to the browser and the widget avoids any CORS issues calling n8n directly.
export async function POST(request) {
  if (!WEBHOOK_URL) {
    return NextResponse.json({ error: 'Chatbot is not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  try {
    const webhookRes = await fetchWithRetry(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId: body?.sessionId }),
    });
    if (!webhookRes.ok) {
      return NextResponse.json({ error: 'Assistant is unavailable right now.' }, { status: 502 });
    }

    const contentType = webhookRes.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await webhookRes.json() : await webhookRes.text();

    return NextResponse.json({ reply: extractReplyText(data) });
  } catch (err) {
    console.error('Chatbot webhook request failed:', err);
    return NextResponse.json({ error: 'Assistant is unavailable right now.' }, { status: 502 });
  }
}
