// src/inngest/functions.ts

import { inngest } from './client';
import { db } from '@/lib/db';
import { botDocuments, botDocumentChunks, bots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import mammoth from 'mammoth';

// --- THE FINAL, DEFINITIVE FIX for Vercel Build Error ---
// We explicitly import the 'legacy' build of pdfjs-dist. This version is
// specifically designed for Node.js environments (like Vercel Serverless Functions)
// and does not depend on browser-only APIs like DOMMatrix.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world-function' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { event, body: 'Hello, World!' };
  }
);

const DOCUMENT_PROCESSED_EVENT = 'app/document.processed';
const DOCUMENT_UPLOADED_EVENT = 'app/document.uploaded';

export const processDocument = inngest.createFunction(
  {
    id: 'process-document-function-v4',
    concurrency: { limit: 5 },
    onFailure: async ({ event, error }) => {
      const eventData = event.data as any;
      if (!eventData || typeof eventData.documentId !== 'string') {
        console.error('[INNGESET] Failure event missing documentId.', event);
        return;
      }
      const { documentId } = eventData;
      console.error(`[INNGESET] Failed to process document ${documentId}`, error);
      await db.update(botDocuments).set({ status: 'FAILED', errorMessage: error.message }).where(eq(botDocuments.id, documentId));
    },
  },
  { event: DOCUMENT_UPLOADED_EVENT },
  async ({ event, step }) => {
    const { documentId } = event.data;

    await step.run('update-status-to-processing', async () => {
      await db.update(botDocuments).set({ status: 'PROCESSING' }).where(eq(botDocuments.id, documentId));
    });

    const documents = await step.run('download-and-parse-file', async () => {
      const [docInfo] = await db
        .select({
          storagePath: botDocuments.storagePath,
          fileType: botDocuments.fileType,
        })
        .from(botDocuments)
        .where(eq(botDocuments.id, documentId));

      if (!docInfo || !docInfo.storagePath || !docInfo.fileType) {
        throw new Error(`Document info not found for ID: ${documentId}`);
      }
      
      const response = await fetch(docInfo.storagePath);
      if (!response.ok) {
        throw new Error(`Failed to download file. Status: ${response.status}`);
      }
      
      const fileBuffer = await response.arrayBuffer();
      const fileType = docInfo.fileType;
      let rawText = '';

      switch (fileType) {
        case 'application/pdf':
          const pdfDoc = await pdfjs.getDocument(fileBuffer).promise;
          let pdfText = '';
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            // The item structure is slightly different in the legacy build
            pdfText += textContent.items.map((item: any) => (item as any).str).join(' ');
          }
          rawText = pdfText;
          break;
        case 'text/plain':
        case 'text/csv':
        case 'application/json':
          rawText = new TextDecoder().decode(fileBuffer);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          const docxResult = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
          rawText = docxResult.value;
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
      return [new Document({ pageContent: rawText })];
    });

    const [botInfo] = await db.select({
        botId: bots.id,
        ragConfig: bots.ragConfig
    }).from(bots).where(eq(bots.id, (await db.select({ botId: botDocuments.botId }).from(botDocuments).where(eq(botDocuments.id, documentId)))[0].botId));

    if (!botInfo || !botInfo.ragConfig) {
      throw new Error(`Could not find bot or RAG config for document ID: ${documentId}`);
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: botInfo.ragConfig.chunkSize,
      chunkOverlap: botInfo.ragConfig.overlap,
    });
    const chunks = await splitter.splitDocuments(documents);

    const embeddings = await step.run('generate-embeddings', async () => {
        const ollamaEmbeddings = new OllamaEmbeddings({
            model: 'nomic-embed-text',
            baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        });
        return ollamaEmbeddings.embedDocuments(chunks.map((c) => c.pageContent));
    });
    
    const chunkDataToInsert = chunks.map((chunk, index) => ({
      botId: botInfo.botId,
      documentId: documentId,
      chunkText: chunk.pageContent,
      embedding: `[${embeddings[index].join(',')}]` as any,
      chunkIndex: index,
    }));

    await step.run('save-chunks-to-db', async () => {
      const batchSize = 100;
      for (let i = 0; i < chunkDataToInsert.length; i += batchSize) {
        await db.insert(botDocumentChunks).values(chunkDataToInsert.slice(i, i + batchSize));
      }
      return { chunkCount: chunks.length };
    });

    await step.run('update-status-to-processed', async () => {
      await db.update(botDocuments).set({
        status: 'PROCESSED',
        processedAt: new Date(),
        chunkCount: chunks.length,
      }).where(eq(botDocuments.id, documentId));
    });

    await step.sendEvent('send-processed-event', {
      name: 'app/document.processed',
      data: { documentId: documentId, status: 'PROCESSED' },
    });

    return { event, body: `Successfully processed document ${documentId} into ${chunks.length} chunks.` };
  }
);