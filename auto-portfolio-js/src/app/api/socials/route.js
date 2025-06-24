import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/data/socialData.json');

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return Response.json(JSON.parse(data));
  } catch (err) {
    return Response.json({ error: 'Failed to load social links' }, { status: 500 });
  }
}
