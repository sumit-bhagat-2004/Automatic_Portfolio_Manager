import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'src/data/projectData.json');

export async function GET() {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return Response.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading admin data:", error);
    return Response.json({});
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving admin data:", error);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}
