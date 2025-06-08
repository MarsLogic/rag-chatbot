## Project Context: RAG SaaS Chatbot Platform (Project "JarwoNext")

**My Role:** Solo Developer, leveraging AI for rapid development ("Vibe AI Coding").

**Project Vision (from PRD v1.3, Section 1):**
To be the leading platform for effortlessly building and deploying intelligent RAG chatbots, empowering anyone to leverage the power of conversational AI.

**Core Technology Approach (Approach 3 - from Tech Arch v1.3, Section 1.2 & 3):**
A composed stack of managed cloud services with a phased development:
*   **Phase 1:** Local RAG Pipeline & Basic UI (Proof of Concept & RAG Quality Validation) - Python/TS, Ollama, LanceDB/local pgvector.
*   **Phase 2 (MVP):** Core Platform SaaS - Next.js (Vercel), tRPC API (on Next.js or Fly.io/Render), Neon (Postgres + `pgvector`), NextAuth.js, Cloudflare R2, Inngest/Trigger.dev, BYOK Cloud LLMs.
*   **Phase 3 & Beyond:** Advanced Features & Scaling.

**Key Project Documents (Version 1.3 - I have these locally and will provide relevant sections when you ask):**
1.  **PRD (Product Requirements Document v1.3):** Vision, Use Cases, Features, GUI Pages, NFRs.
2.  **Tech Arch (Technical Architecture Document v1.3):** Phase 1 & 2 architecture, managed services, data flows.
3.  **API Contract (API & Data Contract Spec v1.3):** tRPC procedures, Zod inputs, TypeScript outputs.
4.  **DB Schema (Database Schema Document v1.3):** Drizzle ORM for Neon/`pgvector`, table structures.
5.  **UI Design (User Interface Design Document v1.3):** `shadcn/ui` & Tailwind for Next.js pages.
6.  **DevOps (Deployment and DevOps Document v1.3):** CI/CD for managed services, configurations.
7.  **Testing (Testing and Validation Document v1.3):** QA strategy, test types, tools, criteria.

---

**Workflow & Context Restoration:**

**(INSTRUCTIONS FOR ME: Follow these steps to initiate or resume work.)**

**A. If Starting Project From Scratch (0) or First Time Using This MCP with AI:**
1.  **Local Setup (Done by me before this prompt):**
    *   Project directory created.
    *   Git initialized (`git init`).
    *   Next.js project initialized (`npx create-next-app@latest . --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"`).
    *   `docs` folder created with all 7 v1.3 project documents.
    *   This `MASTER_CONTROL_PROMPT.md` file created.
    *   Initial Git commit made.
2.  **Set "Current Task Focus Selection" below to:**
    ```
    Task Focus: P0.1 - Project Initialization & Core Tooling Setup
    *   Goal: Initialize the project structure, confirm understanding of core tech for Phase 1 & 2, and set up basic configurations for local development tools (Ollama, Drizzle Kit, NextAuth.js basics).
    *   Implied Key Docs: PRD v1.3 (Overall Vision), Tech Arch v1.3 (Phase 1 & 2 Tech Stack), DB Schema v1.3 (Initial Tables).
    My Starting Sub-Task: I've initialized a Next.js project. I want to confirm your understanding of the overall project and then discuss setting up Drizzle ORM with a local PostgreSQL (via Docker for now, as per Tech Arch v1.3 Phase 1 Option B for DB, or for initial Neon dev setup) for the `users` and `bots` tables (DB Schema v1.3, Sections 2.4 & 2.7).
    ```
3.  Then proceed to paste this entire MCP (with the P0.1 task active) into the AI chat.

**B. If Resuming Work, Paused, or Jumping to a New Task:**
1.  In this file, comment out any previously active "Task Focus" block.
2.  From the `MASTER TASK LIST` (at the bottom, commented out), select the *entire* "Task Focus" block you want to work on now.
3.  Uncomment all lines of this selected "Task Focus" block.
4.  Paste this uncommented task block into the "**Current Task Focus Selection**" section below.
5.  Optionally, add a "My Starting Sub-Task:" or "Last time, we completed X..." line for more specific context.
6.  Paste this entire MCP (with your chosen task active) into a new AI chat session.

---

**Current Task Focus Selection:**

**(INSTRUCTIONS FOR ME: Ensure only ONE "Task Focus" block is uncommented and active here. Paste the selected block from the Master Task List (found at the end of this document) into this spot.)**

> **Task Focus: [PASTE SELECTED AND UNCOMMENTED TASK FOCUS BLOCK HERE]**
>
> **My Starting Sub-Task (Optional):** [e.g., "I want to start by defining the Drizzle ORM schema for the `bot_prompts` table."]
> **Status Update (Optional):** [e.g., "Last session, we completed the tRPC procedures for X. Now I want to build the UI for Y."]


---

**Instructions for AI:**
1.  Acknowledge you have received this project context and the selected "Current Task Focus."
2.  Based on the "Current Task Focus" (and "My Starting Sub-Task" or "Status Update" if I provide it), **please identify and explicitly ask me for the specific sections or details from my Key Project Documents (1-7, Version 1.3) that you need to help me effectively.** For example, if I want to create a DB schema, ask for the relevant DB Schema Doc section. If I want to build UI, ask for the UI Design Doc section.
3.  Once I provide the requested information (I will paste relevant snippets), help me generate code, review designs, brainstorm solutions, or plan sub-tasks for the selected "Current Task Focus."
4.  If I state a new "Current Sub-Task" or switch focus slightly within the broader "Task Focus," feel free to ask for relevant document sections again if needed.

---
---

**MASTER TASK LIST (For My Reference - Keep this section commented out when pasting the main MCP body to AI, unless you specifically want the AI to see the whole list for planning, which is generally not needed for a specific task execution)**
```text
# --- Phase 0: Initial Setup ---
# Task Focus: P0.1 - Project Initialization & Core Tooling Setup
# *   Goal: Initialize the project structure, confirm understanding of core tech for Phase 1 & 2, and set up basic configurations for local development tools (Ollama, Drizzle Kit, NextAuth.js basics).
# *   Implied Key Docs: PRD v1.3 (Overall Vision), Tech Arch v1.3 (Phase 1 & 2 Tech Stack), DB Schema v1.3 (Initial Tables).
#
# --- Phase 1: Local RAG Pipeline & Basic UI (Proof of Concept & RAG Quality Validation) ---
# (Primary Docs for Phase 1: PRD v1.3 (Sec 6.1), Tech Arch v1.3 (Sec 2))
#
# Task Focus: P1.1 - Document Loading & Parsing (Local)
# *   Goal: Implement local loading and text extraction for core document types (PDF, TXT initially, then DOCX, JSON, CSV, MD).
# *   Implied Key Docs: PRD (6.1), Tech Arch (2.2 - Python/TS, LangChain/LlamaIndex).
#
# Task Focus: P1.2 - Text Chunking Strategies (Local)
# *   Goal: Implement and experiment with text chunking strategies (e.g., RecursiveCharacterTextSplitter).
# *   Implied Key Docs: PRD (6.1), Tech Arch (2.2).
#
# Task Focus: P1.3 - Embedding Generation (Local Ollama)
# *   Goal: Implement embedding generation for text chunks using a local Ollama model.
# *   Implied Key Docs: PRD (6.1), Tech Arch (2.2).
#
# Task Focus: P1.4 - Vector Storage & Retrieval (Local)
# *   Goal: Implement local vector storage (LanceDB or Dockerized `pgvector`) and similarity search.
# *   Implied Key Docs: PRD (6.1), Tech Arch (2.2), DB Schema (2.10 for `pgvector` if chosen early).
#
# Task Focus: P1.5 - Prompt Engineering & LLM Interaction (Local Ollama)
# *   Goal: Develop and iterate on prompt templates for RAG, interact with local Ollama LLM for responses.
# *   Implied Key Docs: PRD (6.1), Tech Arch (2.2).
#
# Task Focus: P1.6 - Minimal RAG Test UI/CLI
# *   Goal: Create a basic interface to test the end-to-end local RAG pipeline.
# *   Implied Key Docs: PRD (6.1), Tech Arch (2.2).
#
# Task Focus: P1.7 - RAG Quality Evaluation & Iteration
# *   Goal: Systematically test the local RAG pipeline against golden questions/documents and iterate on components (chunking, embedding, prompting) to meet quality targets.
# *   Implied Key Docs: PRD (6.1, 9 - Phase 1 Success Metric), Testing Doc (3.9, 4.4).
#
# --- Phase 2: Core Platform MVP Features (Composed Managed Services) ---
# (Primary Docs for Phase 2 overall: PRD (Sec 6.2, 7), Tech Arch (Sec 3+), API Contract (all), DB Schema (all), UI Design (all), DevOps (all), Testing (all))
#
# Task Focus: P2.F1.A - User Authentication Setup (NextAuth.js & DB)
# *   Goal: Implement core user signup (Email/Pass, Google, GitHub) and login.
# *   Implied Key Docs: PRD (6.2-F1), API (4.1, 4.2), DB Schema (2.4), UI Design (3.1-3.3), Tech Arch (3.3, 4.4).
#
# Task Focus: P2.F1.B - BYOK LLM API Key Management
# *   Goal: Allow users to securely manage their LLM API keys.
# *   Implied Key Docs: PRD (6.2-F1), API (2.4, 4.2), DB Schema (2.6), UI Design (3.4 - LLM API Keys Tab).
#
# Task Focus: P2.F2_F7.A - Bot Creation & Basic Management (Metadata & Listing)
# *   Goal: Implement creation of bot entities, core RAG config, LLM selection, and listing/basic info display.
# *   Implied Key Docs: PRD (6.2-F2, F7), API (2.5, 4.3), DB Schema (2.7), UI Design (3.6 - Step 1 & 3, 3.7, 3.8.1, 3.8.4).
#
# Task Focus: P2.F3.A - Knowledge Base - File Upload Infrastructure (R2 & Inngest Trigger)
# *   Goal: Set up file uploads to Cloudflare R2 and async processing trigger via Inngest/Trigger.dev.
# *   Implied Key Docs: PRD (6.2-F3), API (4.4 - presigned URLs, confirm), DB Schema (2.9 - `bot_documents` initial), Tech Arch (3.3, 3.5), DevOps (5.4).
#
# Task Focus: P2.F3.B - Knowledge Base - Document Processing Worker (PDF/TXT via Inngest)
# *   Goal: Implement Inngest/Trigger.dev worker logic to process uploaded PDF/TXT files (load, chunk, embed via BYOK, store in `pgvector`).
# *   Implied Key Docs: PRD (6.2-F3), Tech Arch (3.3, 3.4), DB Schema (2.9, 2.10, 6).
#
# Task Focus: P2.F3.C - Knowledge Base - Manual Text Input Feature
# *   Goal: Allow users to add KB content via direct text input.
# *   Implied Key Docs: PRD (6.2-F3), API (4.4 - `addManualText`), DB Schema (2.9 - `sourceType`), UI Design (3.8.2).
#
# Task Focus: P2.F3.D - Knowledge Base - DOCX, JSON, CSV Support in Worker
# *   Goal: Extend document processing worker to handle DOCX, JSON, CSV files.
# *   Implied Key Docs: PRD (6.2-F3), Tech Arch (3.4), DB Schema (2.9 `sourceType`).
#
# Task Focus: P2.F3.E - Knowledge Base - UI Management (List, Delete Sources)
# *   Goal: Build UI for listing KB sources, showing status, deleting sources.
# *   Implied Key Docs: UI Design (3.8.2), API (4.4 - `listByBotId`, `delete`).
#
# Task Focus: P2.F4 - System Prompt Management (Multiple Named Prompts)
# *   Goal: Allow users to create, manage, and activate multiple named system prompts per bot.
# *   Implied Key Docs: PRD (6.2-F4), API (2.6, 4.5), DB Schema (2.8, update 2.7 for `activePromptId`), UI Design (3.8.3).
#
# Task Focus: P2.F5 - Widget & Embed Feature
# *   Goal: Implement widget generation, basic customization, live preview, and embed code.
# *   Implied Key Docs: PRD (6.2-F5), API (2.8, 4.6), DB Schema (2.11), UI Design (3.8.5).
#
# Task Focus: P2.F6 - Chatbot Testing Interface
# *   Goal: Build the UI for users to test their configured bots, including source display and feedback.
# *   Implied Key Docs: PRD (6.2-F6), API (4.7 - `streamQuery`, `submitFeedback`), DB Schema (for feedback table), UI Design (3.9).
#
# Task Focus: P2.F8 - Basic Analytics Implementation
# *   Goal: Implement basic analytics display for users (overview and bot-specific).
# *   Implied Key Docs: PRD (6.2-F8), API (4.9), DB Schema (2.13, 2.14), UI Design (3.10, 3.11).
#
# Task Focus: P2.F9 - Template Gallery & Usage Feature
# *   Goal: Allow users to browse and clone bot templates.
# *   Implied Key Docs: PRD (6.2-F9), API (4.8), DB Schema (2.12), UI Design (3.12).
#
# Task Focus: P2.F10 - Core Admin Dashboard Implementation
# *   Goal: Implement basic admin oversight capabilities (view users/bots, modify roles).
# *   Implied Key Docs: PRD (6.2-F10), API (4.10), DB Schema (user roles), UI Design (3.13).
#
# Task Focus: P2.MVP.TEST - MVP End-to-End Testing & Refinement
# *   Goal: Conduct thorough E2E testing of all MVP features deployed to staging.
# *   Implied Key Docs: Testing Doc (all relevant sections for MVP features).
#
# Task Focus: P2.MVP.DEPLOY - MVP Deployment & DevOps Finalization
# *   Goal: Configure CI/CD pipelines for all services, deploy all MVP components to production environment.
# *   Implied Key Docs: DevOps Doc (all sections, focusing on production setup).
#
# --- Phase 3 & Beyond: Advanced Features, SaaS Scaling & Market Specialization ---
# (Refer to PRD v1.3, Section 6.3 for the extensive list. Each of those (SF1-SF9, plus others like Advanced RAG, Channel Integrations, Workspaces, Credit System, Localization) would become its own "Task Focus" block when prioritized.)
#
# Task Focus: P3.SFX - [Specific Advanced Feature Name, e.g., Workspace Implementation]
# *   Goal: [Goal of the advanced feature]
# *   Implied Key Docs: [Relevant sections from all 7 documents for this specific feature]
#
# Task Focus: P3.CREDIT_SYS - Platform Credit System Implementation
# *   Goal: Implement a credit system for LLM usage as an alternative/addition to BYOK.
# *   Implied Key Docs: PRD (6.3-SF9), API (new procedures for credit purchase/deduction), DB Schema (new tables for credit balance/transactions), UI Design (UI for credit display/purchase), Testing Doc (test cases for credit system).
#
# Task Focus: P3.PLATFORM_API - Tenant Platform API Key Management
# *   Goal: Allow tenants to generate API keys for programmatic access to their resources on our platform.
# *   Implied Key Docs: PRD (Phase 3), API (new procedures for platform key CRUD), DB Schema (new table for platform API keys), UI Design (UI for platform key management), Testing Doc.
#