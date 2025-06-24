// 3️⃣ /api/regenerate-all/route.js
import fs from 'fs';
import path from 'path';

const githubApi = 'https://api.github.com/users';
const filePath = path.resolve(process.cwd(), 'src/data/summaryData.json');

export async function POST() {
  const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  if (!username) return Response.json({ error: 'Missing GitHub username' }, { status: 400 });

  try {
    const githubRes = await fetch(`${githubApi}/${username}/repos?per_page=100`);
    const githubData = await githubRes.json();

    const finalMap = {};
    for (const repo of githubData) {
      let summary = 'No summary';
      try {
        const readmeRes = await fetch(`https://raw.githubusercontent.com/${username}/${repo.name}/master/README.md`);
        const readme = await readmeRes.text();

        const geminiRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readme }),
        });
        const geminiData = await geminiRes.json();
        summary = geminiData.summary;
      } catch (e) {
        console.warn(`Could not generate summary for ${repo.name}`);
      }

      finalMap[repo.name] = {
        id: repo.id,
        name: repo.name,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        summary,
        tags: [],
        visible: true,
      };
    }

    fs.writeFileSync(filePath, JSON.stringify(finalMap, null, 2), 'utf-8');
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Failed to regenerate' }, { status: 500 });
  }
}
