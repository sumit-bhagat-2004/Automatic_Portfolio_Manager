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
          name: 'Sumit Bhagat',
          titles: JSON.stringify(["Full-Stack Developer", "Crafting Digital Experiences", "Building Scalable Solutions"]),
          email: 'sumitbhagat011@gmail.com',
          githubUrl: 'https://github.com/sumit-bhagat-2004',
          linkedinUrl: '',
          twitterUrl: '',
          skillsData: JSON.stringify([]),
          chatbotPrompt: '',
        },
      });
    }

    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_authenticated')?.value === 'true';

    return NextResponse.json({
      ...config,
      layoutOrder: JSON.parse(config.layoutOrder),
      bentoData: config.bentoData ? JSON.parse(config.bentoData) : null,
      titles: config.titles ? JSON.parse(config.titles) : ["Full-Stack Developer", "Crafting Digital Experiences", "Building Scalable Solutions"],
      skillsData: config.skillsData ? JSON.parse(config.skillsData) : [],
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
      geminiProxyKey,
      geminiModel,
      name,
      titles,
      email,
      githubUrl,
      linkedinUrl,
      twitterUrl,
      skillsData,
      chatbotPrompt
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
    if (geminiModel !== undefined) updateData.geminiModel = geminiModel;
    if (name !== undefined) updateData.name = name;
    if (titles !== undefined) updateData.titles = JSON.stringify(titles);
    if (email !== undefined) updateData.email = email;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (twitterUrl !== undefined) updateData.twitterUrl = twitterUrl;
    if (skillsData !== undefined) updateData.skillsData = JSON.stringify(skillsData);
    if (chatbotPrompt !== undefined) updateData.chatbotPrompt = chatbotPrompt;

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
          name: name || 'Sumit Bhagat',
          titles: JSON.stringify(titles || ["Full-Stack Developer", "Crafting Digital Experiences", "Building Scalable Solutions"]),
          email: email || 'sumitbhagat011@gmail.com',
          githubUrl: githubUrl || 'https://github.com/sumit-bhagat-2004',
          linkedinUrl: linkedinUrl || '',
          twitterUrl: twitterUrl || '',
          skillsData: JSON.stringify(skillsData || []),
          chatbotPrompt: chatbotPrompt || '',
        },
      });
    }

    return NextResponse.json({
      ...config,
      layoutOrder: JSON.parse(config.layoutOrder),
      bentoData: config.bentoData ? JSON.parse(config.bentoData) : null,
      titles: config.titles ? JSON.parse(config.titles) : [],
      skillsData: config.skillsData ? JSON.parse(config.skillsData) : [],
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
