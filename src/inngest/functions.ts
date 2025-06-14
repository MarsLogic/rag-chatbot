// src/inngest/functions.ts

import { inngest } from './client';
import { db } from '@/lib/db';
import { botDocuments, botDocumentChunks, bots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// Direct parsing libraries for maximum stability
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

// =================================================================
// START: "HELLO WORLD" TEST FUNCTION
// =================================================================
export const helloWorld = inngest.createFunction(
  { id: 'hello-world-function' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    console.log('[INNGESET] "Hello, world!" function was triggered!');
    // THE FIX: Added a unique ID 'wait-a-moment' as the first argument
    await step.sleep('wait-a-moment', '1s');
    console.log(`[INNGESET] Event received:`, event.name);
    return { event, body: 'Hello, World!' };
  }
);
// =================================================================
// END: "HELLO WORLD" TEST FUNCTION
// =================================================================

const DOCUMENT_PROCESSED_EVENT = 'app/document.processed';
const DOCUMENT_UPLOADED_EVENT = 'app/document.uploaded';

export const processDocument = inngest.createFunction(
  {
    id: 'process-document-function-v2',
    concurrency: { limit: 5 },
    onFailure: async ({ event, error }) => {
      const { documentId } = event.data;
      console.error(`[INNGESET] Failed to process document ${documentId}`, error);
      await db
        .update(botDocuments)
        .set({ status: 'FAILED', errorMessage: error.message })
        .where(eq(botDocuments.id, documentId));
    },
  },
  { event: DOCUMENT_UPLOADED_EVENT },
  async ({ event, step }) => {
    const { documentId } = event.data;
    console.log(`[INNGESET] Received event to process document: ${documentId}`);

    const docInfo = await step.run('get-document-info', async () => {
      const [doc] = await db
        .select({
          storagePath: botDocuments.storagePath,
          fileType: botDocuments.fileType,
          botId: botDocuments.botId,
          ragConfig: bots.ragConfig,
        })
        .from(botDocuments)
        .leftJoin(bots, eq(botDocuments.botId, bots.id))
        .where(eq(botDocuments.id, documentId));

      if (!doc || !doc.storagePath || !doc.fileType || !doc.ragConfig) {
        throw new Error(`Document info or associated bot config not found for ID: ${documentId}`);
      }
      return doc;
    });

    await step.run('update-status-processing', async () => {
      await db.update(botDocuments).set({ status: 'PROCESSING' }).where(eq(botDocuments.id, documentId));
    });

    const fileBuffer = await step.run('download-file-buffer', async () => {
      const response = await fetch(docInfo.storagePath!);
      if (!response.ok) throw new Error(`Failed to download file. Status: ${response.status}`);
      return response.arrayBuffer();
    });

    const documents = await step.run('parse-document-content', async () => {
      let rawText = '';
      const fileType = docInfo.fileType!;
      console.log(`[INNGESET] Parsing document with fileType: ${fileType}`);

      switch (fileType) {
        case 'application/pdf':
          const pdfData = await pdf(Buffer.from(fileBuffer));
          rawText = pdfData.text;
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

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: docInfo.ragConfig.chunkSize,
      chunkOverlap: docInfo.ragConfig.overlap,
    });
    const chunks = await splitter.splitDocuments(documents);

    const ollamaEmbeddings = new OllamaEmbeddings({
      model: 'nomic-embed-text',
      baseUrl: 'http://localhost:11434',
    });

    const embeddings = await step.run('generate-embeddings', async () => {
      return ollamaEmbeddings.embedDocuments(chunks.map((c) => c.pageContent));
    });

    const chunkDataToInsert = chunks.map((chunk, index) => ({
      botId: docInfo.botId,
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

    await step.run('update-status-processed', async () => {
      await db.update(botDocuments).set({
        status: 'PROCESSED',
        processedAt: new Date(),
        chunkCount: chunks.length,
      }).where(eq(botDocuments.id, documentId));
    });

    await step.sendEvent('send-processed-event', {
      name: DOCUMENT_PROCESSED_EVENT,
      data: { documentId: documentId, status: 'PROCESSED' },
    });

    return { event, body: `Successfully processed document ${documentId} into ${chunks.length} chunks.` };
  }
);