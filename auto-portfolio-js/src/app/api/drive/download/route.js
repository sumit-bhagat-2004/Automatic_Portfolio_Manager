import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const getStoragePath = () => {
  if (process.env.NODE_ENV === 'development' || !fs.existsSync('/app/data')) {
    return path.join(process.cwd(), 'data', 'drive');
  }
  return '/app/data/drive';
};

const checkAuth = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('drive_authenticated')?.value === 'true';
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const view = searchParams.get('view') === 'true';

    if (!name || (type !== 'public' && type !== 'protected')) {
      return new Response('Invalid parameters', { status: 400 });
    }

    if (type === 'protected') {
      const authorized = await checkAuth();
      if (!authorized) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const base = getStoragePath();
    const safeName = path.basename(name);
    const filePath = path.join(base, type, safeName);

    if (!fs.existsSync(filePath)) {
      return new Response('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    let contentType = 'application/octet-stream';
    const ext = path.extname(safeName).toLowerCase();
    if (ext === '.pdf') contentType = 'application/pdf';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.txt') contentType = 'text/plain';
    else if (ext === '.zip') contentType = 'application/zip';

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': view ? 'inline' : `attachment; filename="${safeName}"`,
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
