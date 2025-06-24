import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  const githubPath = path.resolve(process.cwd(), 'src/data/githubData.json');

  if (!username || !token) {
    return Response.json({ error: "Missing GitHub credentials." }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const data = await response.json();

    if (!Array.isArray(data)) {
      return Response.json({ error: "Unexpected API response" }, { status: 500 });
    }

    const repos = await Promise.all(
      data.map(async (repo) => {
        const langRes = await fetch(repo.languages_url, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        const languages = await langRes.json();

        return {
          id: repo.id,
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          stars: repo.stargazers_count,
          language: repo.language,
          languages, // full breakdown per repo
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          open_issues: repo.open_issues_count,
          updated_at: repo.updated_at,
        };
      })
    );

    // Save to githubData.json
    fs.writeFileSync(githubPath, JSON.stringify(repos, null, 2), 'utf-8');

    return Response.json(repos);
  } catch (error) {
    console.error("GitHub fetch failed:", error);
    return Response.json({ error: "Failed to fetch GitHub data." }, { status: 500 });
  }
}

// Add this POST handler:
export async function POST(req) {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  const githubPath = path.resolve(process.cwd(), 'src/data/githubData.json');
  const url = new URL(req.url, 'http://localhost');
  const repoName = url.searchParams.get('repo');
  const refresh = url.searchParams.get('refresh');

  if (!username || !token) {
    return Response.json({ error: "Missing GitHub credentials." }, { status: 500 });
  }

  try {
    if (refresh && repoName) {
      // Refresh a single repo
      const repoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (!repoRes.ok) throw new Error('Failed to fetch repo');
      const repo = await repoRes.json();

      const langRes = await fetch(repo.languages_url, {
        headers: { Authorization: `token ${token}` },
      });
      const languages = await langRes.json();

      // Update only this repo in githubData.json
      let githubData = [];
      try {
        githubData = JSON.parse(fs.readFileSync(githubPath, 'utf-8'));
      } catch {}
      const idx = githubData.findIndex(r => r.name === repoName);
      const newRepo = {
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        languages,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        open_issues: repo.open_issues_count,
        updated_at: repo.updated_at,
      };
      if (idx !== -1) githubData[idx] = newRepo;
      else githubData.push(newRepo);
      fs.writeFileSync(githubPath, JSON.stringify(githubData, null, 2), 'utf-8');
      return Response.json({ success: true });
    } else if (refresh) {
      // Refresh all repos
      const response = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        return Response.json({ error: "Unexpected API response" }, { status: 500 });
      }
      const repos = await Promise.all(
        data.map(async (repo) => {
          const langRes = await fetch(repo.languages_url, {
            headers: { Authorization: `token ${token}` },
          });
          const languages = await langRes.json();
          return {
            id: repo.id,
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            languages,
            forks: repo.forks_count,
            watchers: repo.watchers_count,
            open_issues: repo.open_issues_count,
            updated_at: repo.updated_at,
          };
        })
      );
      fs.writeFileSync(githubPath, JSON.stringify(repos, null, 2), 'utf-8');
      return Response.json({ success: true });
    } else {
      return Response.json({ error: "Missing refresh param" }, { status: 400 });
    }
  } catch (error) {
    console.error("GitHub POST failed:", error);
    return Response.json({ error: "Failed to update GitHub data." }, { status: 500 });
  }
}
