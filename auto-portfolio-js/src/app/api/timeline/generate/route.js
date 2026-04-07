import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const username = process.env.GITHUB_USERNAME;
    const token = process.env.GITHUB_TOKEN;
    
    if (!username || !token) {
      return NextResponse.json(
        { error: 'GitHub credentials not configured' },
        { status: 500 }
      );
    }
    
    // Fetch repos to analyze commit history
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!reposRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub repos' },
        { status: 500 }
      );
    }
    
    const repos = await reposRes.json();
    const events = [];
    const existingProjects = new Set();
    
    // Analyze repos and generate timeline events
    for (const repo of repos.slice(0, 10)) { // Limit to top 10 repos
      const createdYear = new Date(repo.created_at).getFullYear();
      const updatedYear = new Date(repo.updated_at).getFullYear();
      
      const dateRange = createdYear === updatedYear 
        ? createdYear.toString()
        : `${createdYear} - ${updatedYear}`;
      
      // Create project-based timeline events for significant repos
      if (repo.stargazers_count > 5 || repo.forks_count > 2) {
        const projectKey = `${repo.name}-${createdYear}`;
        if (!existingProjects.has(projectKey)) {
          events.push({
            title: `Built ${repo.name}`,
            subtitle: repo.language || 'Multi-language project',
            dateRange,
            description: repo.description || `Open-source project with ${repo.stargazers_count} stars and ${repo.forks_count} forks.`,
            category: 'experience',
            orderIndex: events.length
          });
          existingProjects.add(projectKey);
        }
      }
    }
    
    // Add some intelligent defaults if we have very few events
    if (events.length < 3) {
      const currentYear = new Date().getFullYear();
      events.push({
        title: 'Full-Stack Development Journey',
        subtitle: 'Self-taught Developer',
        dateRange: `${currentYear - 2} - Present`,
        description: 'Building modern web applications with React, Next.js, and Node.js.',
        category: 'experience',
        orderIndex: 0
      });
    }
    
    // Insert into database
    let created = 0;
    for (const event of events) {
      try {
        await prisma.timelineEvent.create({
          data: event
        });
        created++;
      } catch (err) {
        // Skip duplicates or errors
        console.error('Failed to create event:', err);
      }
    }
    
    return NextResponse.json({
      success: true,
      count: created,
      message: `Generated ${created} timeline events from GitHub activity`
    });
    
  } catch (error) {
    console.error('Timeline generation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
