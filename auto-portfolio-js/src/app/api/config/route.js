import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// GET /api/config - Get configuration
export async function GET() {
  try {
    let config = await prisma.config.findFirst();

    if (!config) {
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

    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_authenticated')?.value === 'true';

    return NextResponse.json({
      ...config,
      layoutOrder: JSON.parse(config.layoutOrder),
      bentoData: config.bentoData ? JSON.parse(config.bentoData) : null,
      // Hide secrets from visitors, return them only to authenticated admin
      geminiApiKey: isAdmin ? config.geminiApiKey : null,
      geminiProxyUrl: isAdmin ? config.geminiProxyUrl : null,
      geminiProxyKey: isAdmin ? config.geminiProxyKey : null,
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
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_authenticated')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      theme, 
      layoutOrder, 
      resumeUrl, 
      userImage, 
      bentoData, 
      aiMethod, 
      geminiApiKey, 
      geminiProxyUrl, 
      geminiProxyKey 
    } = body;

    const updateData = {};
    if (theme) updateData.theme = theme;
    if (layoutOrder) updateData.layoutOrder = JSON.stringify(layoutOrder);
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    if (userImage !== undefined) updateData.userImage = userImage;
    if (bentoData) updateData.bentoData = JSON.stringify(bentoData);
    if (aiMethod) updateData.aiMethod = aiMethod;
    if (geminiApiKey !== undefined) updateData.geminiApiKey = geminiApiKey;
    if (geminiProxyUrl !== undefined) updateData.geminiProxyUrl = geminiProxyUrl;
    if (geminiProxyKey !== undefined) updateData.geminiProxyKey = geminiProxyKey;

    const existingConfig = await prisma.config.findFirst();

    let config;
    if (existingConfig) {
      config = await prisma.config.update({
        where: { id: existingConfig.id },
        data: updateData,
      });
    } else {
      config = await prisma.config.create({
        data: {
          theme: theme || 'dark',
          layoutOrder: JSON.stringify(layoutOrder || ['hero', 'projects', 'timeline', 'bento', 'contact']),
          resumeUrl: resumeUrl || null,
          userImage: userImage || null,
          bentoData: bentoData ? JSON.stringify(bentoData) : null,
          aiMethod: aiMethod || 'official',
          geminiApiKey: geminiApiKey || null,
          geminiProxyUrl: geminiProxyUrl || null,
          geminiProxyKey: geminiProxyKey || null,
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
