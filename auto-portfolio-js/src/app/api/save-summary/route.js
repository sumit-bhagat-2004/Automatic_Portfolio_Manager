import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/data/summaryData.json');

export async function POST(req) {
  try {
    const body = await req.json();
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to write summaryData.json:', error);
    return Response.json({ error: 'Failed to write file' }, { status: 500 });
  }
}