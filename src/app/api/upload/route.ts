// src/app/api/upload/route.ts

import { put, type PutBlobResult } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// This specific route can run on the default Node.js runtime.
// No need for 'edge' unless you have a specific reason.

export async function POST(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return new NextResponse('No filename provided', { status: 400 });
  }

  if (!req.body) {
    return new NextResponse('No file body provided', { status: 400 });
  }

  const storagePath = `sources/${nanoid()}-${filename}`;

  // Upload the file to Vercel Blob
  const blob = await put(storagePath, req.body, {
    access: 'public',
    addRandomSuffix: false, 
  });

  // Return the blob details to the frontend
  return NextResponse.json(blob);
}