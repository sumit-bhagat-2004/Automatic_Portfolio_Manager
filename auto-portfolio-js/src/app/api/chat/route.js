import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 1. Fetch context data from database
    const config = await prisma.config.findFirst();
    const projects = await prisma.project.findMany({ where: { visible: true } });
    const timeline = await prisma.timelineEvent.findMany();

    // Parse Bento bio content
    let bioContent = '';
    if (config?.bentoData) {
      try {
        const bento = typeof config.bentoData === 'string' ? JSON.parse(config.bentoData) : config.bentoData;
        bioContent = bento.items?.find(item => item.id === 'bio')?.content || '';
      } catch (e) {
        console.error('Failed to parse bentoData:', e);
      }
    }

    // Format projects context
    const projectsContext = projects.map(p => {
      return `- **${p.name}** (${p.language || 'Unknown'}): ${p.summary || 'No description'}. Link: ${p.url || 'None'}`;
    }).join('\n');

    // Format timeline context
    const timelineContext = timeline.map(t => {
      return `- [${t.category.toUpperCase()}] **${t.title}** at *${t.subtitle || 'N/A'}* (${t.dateRange}): ${t.description || 'No description'}`;
    }).join('\n');

    // 2. Build the System Prompt
    const systemPrompt = `You are a helpful, professional, and friendly AI chatbot representing Sumit Bhagat on his portfolio website.
Your primary role is to answer questions from recruiters and visitors about Sumit's background, projects, work experience, skills, and how to get in touch.

Here is the verified context you must use:
[BIO]
${bioContent || "Full-stack developer passionate about building innovative web applications and contributing to open source."}

[SKILLS / TECHNOLOGIES]
JavaScript, TypeScript, React, Next.js, Node.js, Python, Tailwind CSS, Prisma, SQL, Docker, Caddy, Git

[PROJECTS]
${projectsContext || "No projects listed."}

[EXPERIENCE & EDUCATION TIMELINE]
${timelineContext || "No timeline events listed."}

[CONTACT INFO]
- Email: sumitbhagat011@gmail.com
- GitHub: https://github.com/sumit-bhagat-2004
- LinkedIn: Available on request or via the contact section on the main page.

CRITICAL RULES:
1. Only answer questions related to Sumit's professional background, skills, work, projects, and contact info.
2. If asked about personal matters (e.g., family, dating, political views, private life, or non-work-related topics) or random unrelated general knowledge (e.g., "how to bake a cake"), respond politely but firmly:
   "I can only help you with questions about Sumit's work, experience, and projects."
3. Do not make up facts. If the information is not in the context, say:
   "I don't have that information. You can reach out to Sumit directly via email at sumitbhagat011@gmail.com."
4. Be brief, professional, and polite. Keep answers concise (1-3 sentences when possible).`;

    // 3. Setup endpoint based on database configuration
    const method = config?.aiMethod || 'official';
    let url = '';
    let headers = { 'Content-Type': 'application/json' };
    let body = {};

    // Map message history to Gemini contents structure
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    if (method === 'proxy') {
      const proxyUrl = config?.geminiProxyUrl;
      const proxyKey = config?.geminiProxyKey;
      
      if (!proxyUrl) {
        return NextResponse.json({ error: 'Proxy URL not configured.' }, { status: 500 });
      }

      url = proxyUrl.includes('?') ? `${proxyUrl}&key=${proxyKey}` : `${proxyUrl}?key=${proxyKey}`;
      
      if (proxyUrl.includes('/chat/completions')) {
        headers['Authorization'] = `Bearer ${proxyKey}`;
        body = {
          model: 'gemini-2.0-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content }))
          ]
        };
      } else {
        body = { contents };
      }
    } else {
      const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
      }
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      body = { contents };
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();
    let reply = '';
    
    if (method === 'proxy' && config?.geminiProxyUrl?.includes('/chat/completions')) {
      reply = data?.choices?.[0]?.message?.content;
    } else {
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    return NextResponse.json({ reply: reply || "I couldn't generate a response." });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
