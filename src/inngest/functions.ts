// src/inngest/functions.ts

import { inngest } from './client';
import { db } from '@/lib/db';
import { botDocuments, botDocumentChunks, bots } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// --- CORE LANGCHAIN & PARSER IMPORTS ---
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

// --- DIRECT PARSING LIBRARIES (The "No-Loader" Approach) ---
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const DOCUMENT_PROCESSED_EVENT = 'app/document.processed';
const DOCUMENT_UPLOADED_EVENT = 'app/document.uploaded';

export const processDocument = inngest.createFunction(
  {
    id: 'process-document-function-v2', // Renamed ID to avoid conflicts
    concurrency: {
      limit: 5,
    },
    onFailure: async ({
      event,
      error,
    }: {
      event: { data: { documentId: string } };
      error: Error;
    }) => {
      const { documentId } = event.data;
      console.error(
        `[INNGESET] Failed to process document ${documentId}`,
        error
      );
      await db
        .update(botDocuments)
        .set({ status: 'FAILED', errorMessage: error.message })
        .where(eq(botDocuments.id, documentId));
    },
  },
  { event: DOCUMENT_UPLOADED_EVENT },
  async ({ event, step }) => {
    const { documentId } = event.data as { documentId: string };

    console.log(`[INNGESET] Received event to process document: ${documentId}`);

    const docInfo = await step.run('get-document-info', async () => {
      // ... (This part remains the same)
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
        throw new Error(
          `Document info or associated bot config not found for ID: ${documentId}`
        );
      }
      return doc;
    });

    await step.run('update-status-processing', async () => {
      // ... (This part remains the same)
      console.log(
        `[INNGESET] Updating status to PROCESSING for doc: ${documentId}`
      );
      await db
        .update(botDocuments)
        .set({ status: 'PROCESSING' })
        .where(eq(botDocuments.id, documentId));
      return { success: true };
    });

    const fileBlob = await step.run('download-file', async () => {
      // ... (This part remains the same)
      console.log(`[INNGESET] Downloading file from: ${docInfo.storagePath}`);
      const response = await fetch(docInfo.storagePath!);
      if (!response.ok) {
        throw new Error(`Failed to download file. Status: ${response.status}`);
      }
      return response.blob();
    });

    // =================================================================
    // START: REFACTORED DOCUMENT PARSING LOGIC
    // =================================================================
    const documents = await step.run('parse-document-content', async () => {
      let rawText = '';
      const fileType = docInfo.fileType!;
      console.log(`[INNGESET] Parsing document with fileType: ${fileType}`);

      switch (fileType) {
        case 'application/pdf':
          // pdf-parse needs a Buffer
          const pdfBuffer = Buffer.from(await fileBlob.arrayBuffer());
          const pdfData = await pdf(pdfBuffer);
          rawText = pdfData.text;
          break;

        case 'text/plain':
        case 'text/csv':
        case 'application/json':
          // These types can be read directly as text
          rawText = await fileBlob.text();
          break;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // mammoth needs an ArrayBuffer
          const docxBuffer = await fileBlob.arrayBuffer();
          const docxResult = await mammoth.extractRawText({
            arrayBuffer: docxBuffer,
          });
          rawText = docxResult.value;
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
      
      // Manually create the LangChain Document object
      return [new Document({ pageContent: rawText })];
    });
    // =================================================================
    // END: REFACTORED DOCUMENT PARSING LOGIC
    // =================================================================

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
      console.log(`[INNGESET] Generating ${chunks.length} embeddings...`);
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
      // ... (This part remains the same)
      console.log(`[INNGESET] Saving ${chunkDataToInsert.length} chunks to DB.`);
      const batchSize = 100;
      for (let i = 0; i < chunkDataToInsert.length; i += batchSize) {
        const batch = chunkDataToInsert.slice(i, i + batchSize);
        await db.insert(botDocumentChunks).values(batch);
      }
      return { chunkCount: chunks.length };
    });

    await step.run('update-status-processed', async () => {
      // ... (This part remains the same)
      await db
        .update(botDocuments)
        .set({
          status: 'PROCESSED',
          processedAt: new Date(),
          chunkCount: chunks.length,
        })
        .where(eq(botDocuments.id, documentId));
    });

    await step.sendEvent('send-processed-event', {
      name: DOCUMENT_PROCESSED_EVENT,
      data: { documentId: documentId, status: 'PROCESSED' },
    });

    return {
      event,
      body: `Successfully processed document ${documentId} into ${chunks.length} chunks.`,
    };
  }
);