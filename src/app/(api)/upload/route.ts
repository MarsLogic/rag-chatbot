// src/app/api/upload/route.ts

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { auth } from '@/server/auth';
import { db } from '@/lib/db';
import { bots, botDocuments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// This specific route needs to run on the Edge runtime for Vercel Blob
export const runtime = 'edge';

export async function POST(req: Request) {
  const session = await auth();

  // 1. Check for user authentication
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  // 2. Get botId and filename from the request URL's query parameters
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const botId = searchParams.get('botId');

  if (!filename || !botId) {
    return new Response('Missing filename or botId', { status: 400 });
  }

  // 3. Get the file size from the request headers
  const contentLength = req.headers.get('content-length');
  const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

  // 4. Security Check: Verify the user owns the bot
  const [bot] = await db.select().from(bots).where(eq(bots.id, botId)).limit(1);
  if (!bot || bot.userId !== userId) {
    return new Response('Forbidden', { status: 403 });
  }

  // 5. Generate a unique path for the file in the blob store
  const storagePath = `bots/${botId}/sources/${nanoid()}-${filename}`;
  
  if (!req.body) {
    return new Response('No file body', { status: 400 });
  }

  // 6. Upload the file to Vercel Blob
  const blob = await put(storagePath, req.body, {
    access: 'public',
  });

  // 7. After successful upload, create the document record in our database
  const [newDocument] = await db
    .insert(botDocuments)
    .values({
      botId: botId,
      fileName: filename,
      fileType: blob.contentType,
      fileSize: fileSize, // Use the size from the header
      storagePath: blob.url, // Use the final URL from Vercel Blob
      status: 'UPLOADED',
    })
    .returning();

  // 8. Return the newly created document details to the frontend
  return NextResponse.json(newDocument);
}