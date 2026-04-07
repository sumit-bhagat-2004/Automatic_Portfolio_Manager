import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/config - Get configuration
export async function GET() {
  try {
    // Get the first (and only) config record
    let config = await prisma.config.findFirst();

    if (!config) {
      // Create default config if it doesn't exist
      config = await prisma.config.create({
        data: {
          theme: 'dark',
          layoutOrder: JSON.stringify(['hero', 'projects', 'timeline', 'bento', 'contact']),
          bentoData: JSON.stringify({
            items: [
              { id: 'github', type: 'github-calendar', size: 'large' },
              { id: 'pie-chart', type: 'pie-chart', size: 'medium' },
              { id: 'stats', type: 'stats', size: 'medium' },
              { id: 'skills', type: 'skills', size: 'wide' },
              { id: 'bio', type: 'bio', size: 'wide', content: 'Full-stack developer passionate about building innovative web applications and contributing to open source.' }
            ]
          }),
        },
      });
    }

    return NextResponse.json({
      ...config,
      layoutOrder: JSON.parse(config.layoutOrder),
      bentoData: config.bentoData ? JSON.parse(config.bentoData) : null,
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/config - Update configuration
export async function PUT(request) {
  try {
    const body = await request.json();
    const { theme, layoutOrder, resumeUrl, bentoData } = body;

    const updateData = {};
    if (theme) updateData.theme = theme;
    if (layoutOrder) updateData.layoutOrder = JSON.stringify(layoutOrder);
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (bentoData) updateData.bentoData = JSON.stringify(bentoData);

    // Get existing config
    const existingConfig = await prisma.config.findFirst();

    let config;
    if (existingConfig) {
      // Update existing
      config = await prisma.config.update({
        where: { id: existingConfig.id },
        data: updateData,
      });
    } else {
      // Create new with defaults
      config = await prisma.config.create({
        data: {
          theme: theme || 'dark',
          layoutOrder: JSON.stringify(layoutOrder || ['hero', 'projects', 'timeline', 'bento', 'contact']),
          resumeUrl: resumeUrl || null,
          bentoData: bentoData ? JSON.stringify(bentoData) : null,
        },
      });
    }

    return NextResponse.json({
      ...config,
      layoutOrder: JSON.parse(config.layoutOrder),
      bentoData: config.bentoData ? JSON.parse(config.bentoData) : null,
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
