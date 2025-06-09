// src/app/api/upload/route.ts

import { put, type PutBlobResult } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// This specific route needs to run on the Edge runtime for Vercel Blob
export const runtime = 'edge'; 

export async function POST(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return new NextResponse('No filename provided', { status: 400 });
  }

  if (!req.body) {
    return new NextResponse('No file body provided', { status: 400 });
  }

  // Generate a unique path for the file in the blob store
  // We don't include the botId here anymore to keep this route simple
  const storagePath = `sources/${nanoid()}-${filename}`;

  // Upload the file to Vercel Blob
  const blob = await put(storagePath, req.body, {
    access: 'public',
    // We don't need addRandomSuffix as nanoid already makes it unique
    addRandomSuffix: false, 
  });

  // Return the blob details to the frontend
  return NextResponse.json(blob);
}