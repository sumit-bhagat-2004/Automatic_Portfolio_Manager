import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Read existing JSON data files
  const dataDir = path.join(process.cwd(), 'src', 'data');
  
  const githubDataPath = path.join(dataDir, 'githubData.json');
  const summaryDataPath = path.join(dataDir, 'summaryData.json');
  
  let githubData: any[] = [];
  let summaryData: any = {};

  if (fs.existsSync(githubDataPath)) {
    githubData = JSON.parse(fs.readFileSync(githubDataPath, 'utf-8'));
    console.log(`📦 Loaded ${githubData.length} projects from githubData.json`);
  }

  if (fs.existsSync(summaryDataPath)) {
    summaryData = JSON.parse(fs.readFileSync(summaryDataPath, 'utf-8'));
    console.log(`📝 Loaded ${Object.keys(summaryData).length} project summaries`);
  }

  // Create a map of summaries by project name for easy lookup
  const summaryMap = new Map(
    Object.entries(summaryData).map(([name, data]: [string, any]) => [name, data])
  );

  // Seed projects from GitHub data
  console.log('🚀 Seeding projects...');
  for (const repo of githubData) {
    const summary = summaryMap.get(repo.name);
    const projectUrl = repo.html_url || repo.url || null;
    
    console.log(`   Seeding: ${repo.name} (URL: ${projectUrl})`);
    
    await prisma.project.create({
      data: {
        githubId: repo.id,
        name: repo.name,
        url: projectUrl,
        language: repo.language || 'Unknown',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watchers: repo.watchers_count || 0,
        summary: summary?.summary || repo.description || '',
        tags: JSON.stringify(summary?.tags || []),
        visible: summary?.visible !== false, // default to true
        featured: summary?.featured || false,
      },
    });
  }
  
  const projectCount = await prisma.project.count();
  console.log(`✅ Seeded ${projectCount} projects`);

  // Create default config
  console.log('⚙️ Creating default config...');
  await prisma.config.create({
    data: {
      theme: 'dark',
      layoutOrder: JSON.stringify(['hero', 'projects', 'timeline', 'bento', 'contact']),
      resumeUrl: null,
      bentoData: JSON.stringify({
        items: [
          { id: 'github', type: 'github-calendar', size: 'large' },
          { id: 'stats', type: 'stats', size: 'medium' },
          { id: 'skills', type: 'skills', size: 'medium' },
        ]
      }),
    },
  });
  console.log('✅ Created default config');

  // Create sample timeline events
  console.log('📅 Creating sample timeline events...');
  
  await prisma.timelineEvent.createMany({
    data: [
      {
        title: 'Education',
        subtitle: 'Add your education details',
        dateRange: '2020 - 2024',
        description: 'Edit this in the admin panel',
        category: 'education',
        orderIndex: 0,
      },
      {
        title: 'Experience',
        subtitle: 'Add your work experience',
        dateRange: '2024 - Present',
        description: 'Edit this in the admin panel',
        category: 'experience',
        orderIndex: 0,
      },
    ],
  });
  
  const timelineCount = await prisma.timelineEvent.count();
  console.log(`✅ Created ${timelineCount} timeline events`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
