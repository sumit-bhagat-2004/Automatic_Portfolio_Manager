import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { readme } = await req.json();
    if (!readme) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    // Load AI configurations dynamically from the database
    const config = await prisma.config.findFirst();
    const method = config?.aiMethod || 'official';
    
    let url = '';
    let headers = { 'Content-Type': 'application/json' };
    let body = {};

    const prompt = `
You are an expert technical writer. Read the following GitHub README content and summarize it in 1-2 short lines that describe what the project is, what it does, and its main tech stack if possible.

README:
${readme}
`;

    if (method === 'proxy') {
      const proxyUrl = config?.geminiProxyUrl;
      const proxyKey = config?.geminiProxyKey;
      
      if (!proxyUrl) {
        return Response.json({ error: "Proxy URL not configured in database." }, { status: 500 });
      }

      // If the proxy URL uses query parameters or standard Gemini format
      url = proxyUrl.includes('?') ? `${proxyUrl}&key=${proxyKey}` : `${proxyUrl}?key=${proxyKey}`;
      
      // Support OpenAI chat completion proxy formats
      if (proxyUrl.includes('/chat/completions')) {
        headers['Authorization'] = `Bearer ${proxyKey}`;
        body = {
          model: 'gemini-2.0-flash',
          messages: [{ role: 'user', content: prompt }]
        };
      } else {
        body = {
          contents: [{ parts: [{ text: prompt }] }]
        };
      }
    } else {
      // Official method
      const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return Response.json({ error: "Gemini API key not configured in database." }, { status: 500 });
      }
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();
    let summary = '';
    
    if (method === 'proxy' && config?.geminiProxyUrl?.includes('/chat/completions')) {
      summary = data?.choices?.[0]?.message?.content;
    } else {
      summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    return Response.json({ summary: summary || "Could not summarize." });
  } catch (err) {
    console.error("Gemini Error:", err);
    return Response.json({ error: "Gemini API call failed: " + err.message }, { status: 500 });
  }
}
