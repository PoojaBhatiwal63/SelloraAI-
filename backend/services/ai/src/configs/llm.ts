import dotenv from "dotenv";

dotenv.config();

import { ChatGroq } from "@langchain/groq";




// ==========================================
// GROQ - FALLBACK
// ==========================================

export const groq =
  new ChatGroq({

    model: "openai/gpt-oss-20b",

    temperature: 0.3,

    maxRetries: 2,

  });