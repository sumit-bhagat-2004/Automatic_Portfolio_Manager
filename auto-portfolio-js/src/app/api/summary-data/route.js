// src/app/api/summary-data/route.js

import fs from 'fs';
import path from 'path';

const summaryPath = path.resolve(process.cwd(), 'src/data/summaryData.json');
const githubPath = path.resolve(process.cwd(), 'src/data/githubData.json'); // Save GitHub API data here

export async function GET() {
  try {
    const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    let githubData = [];
    try {
      githubData = JSON.parse(fs.readFileSync(githubPath, 'utf-8'));
    } catch {
      // fallback: no githubData.json
    }

    // Merge languages from githubData into summaryData
    const githubMap = {};
    githubData.forEach(repo => { githubMap[repo.name] = repo; });

    const merged = {};
    Object.entries(summaryData).forEach(([name, repo]) => {
      merged[name] = {
        ...repo,
        languages: githubMap[name]?.languages || {},
        description: githubMap[name]?.description || repo.description || "",
        forks: githubMap[name]?.forks || 0,
        watchers: githubMap[name]?.watchers || 0,
        open_issues: githubMap[name]?.open_issues || 0,
        updated_at: githubMap[name]?.updated_at || "",
      };
    });

    return Response.json(merged);
  } catch (error) {
    console.error("Error reading summary data:", error);
    return Response.json({ error: "Failed to read summary data" }, { status: 500 });
  }
}
