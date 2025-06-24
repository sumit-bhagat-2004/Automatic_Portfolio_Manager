// 2️⃣ /api/reset-summary/route.js
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req = NextRequest) {
  const repo = req.nextUrl.searchParams.get('repo');
  if (!repo) return NextResponse.json({ error: 'Missing repo' }, { status: 400 });

  try {
    const readmeRes = await fetch(`https://raw.githubusercontent.com/${process.env.NEXT_PUBLIC_GITHUB_USERNAME}/${repo}/master/README.md`);
    const readme = await readmeRes.text();

    const geminiRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readme }),
    });
    console.log('Gemini response:', geminiRes)

    const geminiData = await geminiRes.json();
    return NextResponse.json({ summary: geminiData.summary });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to summarize' }, { status: 500 });
  }
}