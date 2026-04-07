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

    // Fetch repositories from GitHub API
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const repos = await response.json();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const repo of repos) {
      // Check if project already exists
      const existing = await prisma.project.findFirst({
        where: { githubId: repo.id },
      });

      if (existing) {
        // Update GitHub-specific fields only (non-destructive)
        // Preserve custom summary, tags, visible, and featured status
        await prisma.project.update({
          where: { id: existing.id },
          data: {
            name: repo.name,
            url: repo.html_url,
            language: repo.language || 'Unknown',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            watchers: repo.watchers_count || 0,
            // Don't update: summary, tags, visible, featured
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
            language: repo.language || 'Unknown',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            watchers: repo.watchers_count || 0,
            summary: repo.description || '',
            tags: JSON.stringify([]),
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
        skipped,
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
