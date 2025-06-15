// src/app/api/chat/route.ts

import { db } from "@/lib/db";
import { decrypt } from "@/lib/security/crypto";
import { auth } from "@/server/auth";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { sql } from "drizzle-orm";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

// FIX: The "export const runtime = 'edge';" line has been removed to allow
// the use of Node.js modules like 'crypto'.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, botId } = body;

    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const lastUserMessage = messages[messages.length - 1];
    
    const bot = await db.query.bots.findFirst({
      where: (bots, { eq }) => eq(bots.id, botId),
    });

    if (!bot) {
      return new Response("Bot not found", { status: 404 });
    }

    const tenantSettings = await db.query.tenantSettings.findFirst({
      where: (settings, { eq }) => eq(settings.userId, userId),
    });

    const apiKeyEncrypted = tenantSettings?.openaiApiKey;
    if (!apiKeyEncrypted) {
      return new Response("OpenAI API Key not configured.", { status: 412 });
    }

    const apiKey = decrypt(apiKeyEncrypted);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: apiKey });
    
    // 1. Retrieve documents from our database
    const queryEmbedding = await embeddings.embedQuery(lastUserMessage.content);
    const vectorQuery = sql`
        SELECT chunk_text
        FROM bot_document_chunks
        WHERE bot_id = ${botId}
        ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
        LIMIT ${bot.ragConfig.topK};
      `;
    const retrievedDocs = await db.execute<{ chunk_text: string }>(vectorQuery);
    const langchainDocs = retrievedDocs.map(doc => new Document({ pageContent: doc.chunk_text }));

    // 2. Create an in-memory vector store and retriever
    const vectorStore = await MemoryVectorStore.fromDocuments(langchainDocs, embeddings);
    const retriever = vectorStore.asRetriever();

    // 3. Create the LangChain components
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0,
      openAIApiKey: apiKey,
      streaming: true,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a helpful assistant named {botName}. Answer the user's question based ONLY on the following context:\n\n{context}`],
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
    ]);
    
    const combineDocsChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: prompt,
    });

    const retrievalChain = await createRetrievalChain({
        retriever,
        combineDocsChain,
    });

    const chatHistory = messages.slice(0, -1).map((m: any) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    );

    // 4. Invoke the final retrieval chain
    const stream = await retrievalChain.stream({
        botName: bot.name,
        input: lastUserMessage.content,
        chat_history: chatHistory,
    });
    
    // 5. Use a robust manual stream
    const readableStream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            for await (const chunk of stream) {
                if (chunk.answer) {
                    controller.enqueue(encoder.encode(chunk.answer));
                }
            }
            controller.close();
        },
    });

    return new Response(readableStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("[CHAT_POST_ERROR]", error);
    return new Response("An internal error occurred. Please try again.", { status: 500 });
  }
}