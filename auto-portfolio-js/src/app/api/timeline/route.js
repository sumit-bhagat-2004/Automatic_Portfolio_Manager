import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/timeline - List all timeline events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 'education' or 'experience'
    const id = searchParams.get('id');

    if (id) {
      // Get single event
      const event = await prisma.timelineEvent.findUnique({
        where: { id: parseInt(id) },
      });

      if (!event) {
        return NextResponse.json(
          { error: 'Timeline event not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(event);
    }

    // List events
    const where = category ? { category } : {};

    const events = await prisma.timelineEvent.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { orderIndex: 'asc' },
      ],
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline events' },
      { status: 500 }
    );
  }
}

// POST /api/timeline - Create new timeline event
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, subtitle, dateRange, description, category, orderIndex } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      );
    }

    if (!['education', 'experience'].includes(category)) {
      return NextResponse.json(
        { error: 'Category must be "education" or "experience"' },
        { status: 400 }
      );
    }

    const event = await prisma.timelineEvent.create({
      data: {
        title,
        subtitle: subtitle || null,
        dateRange: dateRange || '',
        description: description || null,
        category,
        orderIndex: orderIndex || 0,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    );
  }
}

// PUT /api/timeline - Update timeline event
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (updateData.category && !['education', 'experience'].includes(updateData.category)) {
      return NextResponse.json(
        { error: 'Category must be "education" or "experience"' },
        { status: 400 }
      );
    }

    const event = await prisma.timelineEvent.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating timeline event:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Timeline event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update timeline event' },
      { status: 500 }
    );
  }
}

// DELETE /api/timeline - Delete timeline event
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await prisma.timelineEvent.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Timeline event not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete timeline event' },
      { status: 500 }
    );
  }
}
