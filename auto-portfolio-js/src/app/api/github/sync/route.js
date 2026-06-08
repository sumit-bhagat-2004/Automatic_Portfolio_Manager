import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    if (!GITHUB_USERNAME || !GITHUB_TOKEN) {
      return NextResponse.json(
        { error: 'GitHub credentials not configured' },
        { status: 500 }
      );
    }

    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    };

    // Fetch repositories from GitHub API
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      { headers: ghHeaders }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const repos = await response.json();

    let created = 0;
    let updated = 0;

    for (const repo of repos) {
      // Fetch all languages for this repo (returns { JavaScript: 1234, CSS: 456, ... })
      let allLanguages = [];
      try {
        const langRes = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/languages`,
          { headers: ghHeaders }
        );
        if (langRes.ok) {
          const langData = await langRes.json();
          allLanguages = Object.keys(langData); // e.g. ['JavaScript', 'CSS', 'HTML']
        }
      } catch (e) {
        // If languages fetch fails, skip it silently
      }

      // Also get topics
      const topicsRes = repo.topics || [];

      // Merge all languages + topics into tags, deduplicated
      const mergedTags = [...new Set([...topicsRes, ...allLanguages])];

      // Check if project already exists
      const existing = await prisma.project.findFirst({
        where: { githubId: repo.id },
      });

      if (existing) {
        // Update GitHub-specific fields (non-destructive for summary, visible, featured)
        // DO update tags with latest languages + topics
        await prisma.project.update({
          where: { id: existing.id },
          data: {
            name: repo.name,
            url: repo.html_url,
            language: repo.language || null,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            watchers: repo.watchers_count || 0,
            tags: JSON.stringify(mergedTags),
          },
        });
        updated++;
      } else {
        // Create new project with GitHub data
        await prisma.project.create({
          data: {
            githubId: repo.id,
            name: repo.name,
            url: repo.html_url,
            language: repo.language || null,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            watchers: repo.watchers_count || 0,
            summary: repo.description || '',
            tags: JSON.stringify(mergedTags),
            visible: true,
            featured: false,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${created} created, ${updated} updated`,
      stats: {
        total: repos.length,
        created,
        updated,
      },
    });
  } catch (error) {
    console.error('Error syncing GitHub repos:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub repositories', details: error.message },
      { status: 500 }
    );
  }
}
