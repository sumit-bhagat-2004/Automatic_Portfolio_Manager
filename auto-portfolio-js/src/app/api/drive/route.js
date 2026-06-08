import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const getStoragePath = () => {
  if (process.env.NODE_ENV === 'development' || !fs.existsSync('/app/data')) {
    return path.join(process.cwd(), 'data', 'drive');
  }
  return '/app/data/drive';
};

const ensureDirs = (basePath) => {
  const pub = path.join(basePath, 'public');
  const prot = path.join(basePath, 'protected');
  if (!fs.existsSync(pub)) fs.mkdirSync(pub, { recursive: true });
  if (!fs.existsSync(prot)) fs.mkdirSync(prot, { recursive: true });
};

const checkAuth = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('drive_authenticated')?.value === 'true';
};

export async function GET(request) {
  try {
    const base = getStoragePath();
    ensureDirs(base);
    const authorized = await checkAuth();
    
    const files = [];
    const pubDir = path.join(base, 'public');
    const protDir = path.join(base, 'protected');

    // Read public files
    if (fs.existsSync(pubDir)) {
      const pubFiles = fs.readdirSync(pubDir);
      for (const name of pubFiles) {
        const filePath = path.join(pubDir, name);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          files.push({
            name,
            size: stats.size,
            uploadedAt: stats.mtime,
            type: 'public'
          });
        }
      }
    }

    // Read protected files (only if authorized)
    if (authorized && fs.existsSync(protDir)) {
      const protFiles = fs.readdirSync(protDir);
      for (const name of protFiles) {
        const filePath = path.join(protDir, name);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          files.push({
            name,
            size: stats.size,
            uploadedAt: stats.mtime,
            type: 'protected'
          });
        }
      }
    }

    // Sort by upload date descending
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return NextResponse.json({ files, authorized });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authorized = await checkAuth();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'protected';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (type !== 'public' && type !== 'protected') {
      return NextResponse.json({ error: 'Invalid folder type' }, { status: 400 });
    }

    const base = getStoragePath();
    ensureDirs(base);
    const targetDir = path.join(base, type);
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_');
    const destPath = path.join(targetDir, safeName);
    
    fs.writeFileSync(destPath, buffer);
    return NextResponse.json({ success: true, name: safeName, type });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authorized = await checkAuth();
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type } = await request.json();

    if (!name || (type !== 'public' && type !== 'protected')) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const base = getStoragePath();
    const filePath = path.join(base, type, path.basename(name));

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
