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

    const name = config?.name || 'Sumit Bhagat';
    const email = config?.email || 'sumitbhagat011@gmail.com';
    const githubUrl = config?.githubUrl || 'https://github.com/sumit-bhagat-2004';
    const linkedinUrl = config?.linkedinUrl || 'Available on request';
    const twitterUrl = config?.twitterUrl || 'Available on request';

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

    // Parse SkillsData
    let skillsList = 'JavaScript, TypeScript, React, Next.js, Node.js, Python, Tailwind CSS, Prisma, SQL, Docker, Caddy, Git';
    if (config?.skillsData) {
      try {
        const parsedSkills = JSON.parse(config.skillsData);
        if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
          skillsList = parsedSkills.map(s => s.name).join(', ');
        }
      } catch (e) {
        console.error('Failed to parse skillsData:', e);
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
    const defaultInstructions = `You are a helpful, professional, and friendly AI chatbot representing ${name} on his portfolio website.
Your primary role is to answer questions from recruiters and visitors about ${name}'s background, projects, work experience, skills, and how to get in touch.`;

    const customPrompt = config?.chatbotPrompt?.trim() || defaultInstructions;

    const systemPrompt = `${customPrompt}

Here is the verified context you must use:
[BIO]
${bioContent || "Full-stack developer passionate about building innovative web applications and contributing to open source."}

[SKILLS / TECHNOLOGIES]
${skillsList}

[PROJECTS]
${projectsContext || "No projects listed."}

[EXPERIENCE & EDUCATION TIMELINE]
${timelineContext || "No timeline events listed."}

[CONTACT INFO]
- Email: ${email}
- GitHub: ${githubUrl}
- LinkedIn: ${linkedinUrl}
- Twitter: ${twitterUrl}

CRITICAL RULES:
1. Only answer questions related to ${name}'s professional background, skills, work, projects, and contact info.
2. If asked about personal matters (e.g., family, dating, political views, private life, or non-work-related topics) or random unrelated general knowledge (e.g., "how to bake a cake"), respond politely but firmly:
   "I can only help you with questions about ${name}'s work, experience, and projects."
3. Do not make up facts. If the information is not in the context, say:
   "I don't have that information. You can reach out to ${name} directly via email at ${email}."
4. Be brief, professional, and polite. Keep answers concise (1-3 sentences when possible).`;

    // 3. Setup endpoint based on database configuration
    const method = config?.aiMethod || 'official';
    const modelId = config?.geminiModel || 'gemini-2.0-flash';
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
      const proxyBase = config?.geminiProxyUrl;
      const proxyKey = config?.geminiProxyKey;

      if (!proxyBase) {
        return NextResponse.json({ error: 'Proxy URL not configured.' }, { status: 500 });
      }

      // Build the endpoint: replace MODEL_ID placeholder or append model path
      let proxyEndpoint;
      if (proxyBase.includes('MODEL_ID')) {
        proxyEndpoint = proxyBase.replace('MODEL_ID', modelId);
      } else if (proxyBase.includes('/models/')) {
        proxyEndpoint = proxyBase;
      } else {
        const base = proxyBase.replace(/\/+$/, '');
        proxyEndpoint = `${base}/v1/models/${modelId}:generateContent`;
      }

      if (proxyBase.includes('/chat/completions')) {
        headers['Authorization'] = `Bearer ${proxyKey}`;
        body = {
          model: modelId,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(msg => ({ role: msg.role, content: msg.content }))
          ]
        };
      } else {
        // Gemini-native format
        if (proxyKey) headers['x-goog-api-key'] = proxyKey;
        body = { contents };
      }

      url = proxyEndpoint;
    } else {
      const apiKey = config?.geminiApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
      }
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      body = { contents };
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Chat API error response:', errText);
      return NextResponse.json({ error: `AI API returned ${geminiRes.status}` }, { status: 502 });
    }

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
