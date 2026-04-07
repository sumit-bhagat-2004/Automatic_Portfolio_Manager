import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Safe JSON parser helper
function safeParseJSON(str, defaultValue = []) {
  if (!str || str === 'null' || str === 'undefined') return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('JSON parse error:', e, 'Input:', str);
    return defaultValue;
  }
}

// GET /api/projects - List all projects or get single project by ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single project
      const project = await prisma.project.findUnique({
        where: { id: parseInt(id) },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...project,
        tags: safeParseJSON(project.tags, []),
      });
    }

    // List all projects
    const visibleOnly = searchParams.get('visible') === 'true';
    const featuredOnly = searchParams.get('featured') === 'true';

    const where = {};
    if (visibleOnly) where.visible = true;
    if (featuredOnly) where.featured = true;

    const projects = await prisma.project.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { stars: 'desc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(
      projects.map(p => ({
        ...p,
        tags: safeParseJSON(p.tags, []),
      }))
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, url, language, stars, forks, watchers, summary, tags, visible, featured } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        url: url || null,
        language: language || 'Unknown',
        stars: stars || 0,
        forks: forks || 0,
        watchers: watchers || 0,
        summary: summary || '',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        visible: visible !== undefined ? visible : true,
        featured: featured || false,
      },
    });

    return NextResponse.json(
      {
        ...project,
        tags: safeParseJSON(project.tags, []),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects - Update existing project
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Convert tags to JSON string if present and is array
    if (updateData.tags) {
      // If it's already a string (from admin panel), use as is
      // If it's an array (from direct API call), stringify it
      if (typeof updateData.tags !== 'string') {
        updateData.tags = JSON.stringify(updateData.tags);
      }
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      ...project,
      tags: safeParseJSON(project.tags, []),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects - Delete project
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
