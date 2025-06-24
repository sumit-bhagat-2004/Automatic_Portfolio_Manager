export async function POST(req) {
  const { readme } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !readme) {
    return Response.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    const prompt = `
You are an expert technical writer. Read the following GitHub README content and summarize it in 1-2 short lines that describe what the project is, what it does, and its main tech stack if possible.

README:
${readme}
`;

    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await geminiRes.json();

    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return Response.json({ summary: summary || "Could not summarize." });
  } catch (err) {
    console.error("Gemini Error:", err);
    return Response.json({ error: "Gemini API call failed." }, { status: 500 });
  }
}
