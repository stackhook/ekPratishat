import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');

  // 1. Security Check
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 2. Perform Revalidation
  try {
    if (tag || path) {
      if (tag) {
        revalidateTag(tag);
      }
      if (path) {
        revalidatePath(path);
      }
      return NextResponse.json({ revalidated: true, tag, path, now: Date.now() });
    }
    
    // Fallback: Clear the whole homepage cache
    revalidatePath('/'); 
    return NextResponse.json({ revalidated: true, path: '/', now: Date.now() });
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
