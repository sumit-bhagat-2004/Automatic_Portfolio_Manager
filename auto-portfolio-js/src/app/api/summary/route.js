import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { readme, repoName, language, stars, tags } = await req.json();
    if (!readme && !repoName) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    // Load AI configurations dynamically from the database
    const config = await prisma.config.findFirst();
    const method = config?.aiMethod || 'official';
    const modelId = config?.geminiModel || 'gemini-2.0-flash';

    let url = '';
    let headers = { 'Content-Type': 'application/json' };
    let body = {};

    // Rich HTML description prompt
    const prompt = `You are an expert full-stack developer and technical writer. Based on the GitHub repository data below, generate a rich, engaging project description in HTML format.

Repository: ${repoName || 'Unknown'}
Primary Language: ${language || 'Unknown'}
Stars: ${stars || 0}
Tags/Topics: ${(tags || []).join(', ') || 'None'}

README Content:
${readme || 'No README available.'}

Generate a concise yet comprehensive HTML description with the following structure:
- A short punchy opening sentence (wrapped in <p>)
- A <ul> list of 3-5 key features/highlights
- A closing sentence about the tech stack or use case (wrapped in <p>)

Rules:
- Keep it professional, developer-friendly, and accurate
- Use <strong> for important terms, tech names
- No markdown, no code blocks - pure HTML only
- Max ~150 words total
- Do NOT include <html>, <body>, <head> tags
- Output ONLY the HTML snippet, nothing else`;

    if (method === 'proxy') {
      // Use custom proxy endpoint with model substitution:
      // Format: https://gemini.bhagatsumit.xyz/v1/models/${MODEL_ID}:generateContent
      const proxyBase = config?.geminiProxyUrl;
      const proxyKey = config?.geminiProxyKey;

      if (!proxyBase) {
        return Response.json({ error: "Proxy URL not configured in database." }, { status: 500 });
      }

      // Build the endpoint
      let proxyEndpoint;
      let useOpenAIFormat = false;

      if (proxyBase.includes('/chat/completions')) {
        // Explicit OpenAI-compatible endpoint
        proxyEndpoint = proxyBase;
        useOpenAIFormat = true;
      } else if (proxyBase.includes('MODEL_ID')) {
        // Gemini-native with MODEL_ID placeholder
        proxyEndpoint = proxyBase.replace('MODEL_ID', modelId);
      } else if (proxyBase.includes('/models/') && proxyBase.includes('generateContent')) {
        // Full Gemini-native URL already
        proxyEndpoint = proxyBase;
      } else {
        // Plain base URL - assume OpenAI-compatible proxy (like gemini.bhagatsumit.xyz)
        const base = proxyBase.replace(/\/+$/, '');
        proxyEndpoint = `${base}/v1/chat/completions`;
        useOpenAIFormat = true;
      }

      if (useOpenAIFormat) {
        // OpenAI-compatible format
        headers['Authorization'] = `Bearer ${proxyKey}`;
        body = {
          model: modelId,
          messages: [{ role: 'user', content: prompt }]
        };
      } else {
        // Gemini-native format
        if (proxyKey) {
          proxyEndpoint = `${proxyEndpoint}?key=${proxyKey}`;
          headers['Authorization'] = `Bearer ${proxyKey}`;
        }
        body = {
          contents: [{ parts: [{ text: prompt }] }]
        };
      }

      url = proxyEndpoint;
    } else {
      // Official Google Generative Language API
      const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return Response.json({ error: "Gemini API key not configured in database." }, { status: 500 });
      }
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.text();
      console.error('Gemini API error response:', errData);
      return Response.json({ error: `AI API returned ${geminiRes.status}: ${errData}` }, { status: 502 });
    }

    const data = await geminiRes.json();
    let summary = '';

    if (method === 'proxy' && (config?.geminiProxyUrl?.includes('/chat/completions') || !config?.geminiProxyUrl?.includes('/models/'))) {
      summary = data?.choices?.[0]?.message?.content;
    } else {
      summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    // Clean up any accidental markdown code blocks
    if (summary) {
      summary = summary.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    }

    return Response.json({ summary: summary || "<p>No description available.</p>" });
  } catch (err) {
    console.error("Gemini Error:", err);
    return Response.json({ error: "Gemini API call failed: " + err.message }, { status: 500 });
  }
}
