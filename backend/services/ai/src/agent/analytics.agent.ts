import { groq } from "../configs/llm.js";

import type {
  AnalyticsData,
  AIAnalytics,
} from "../types/analytics.types.js";

// ==========================================
// PROMPT
// ==========================================

const prompt = (data: AnalyticsData) => `
You are an AI analytics assistant for SelloraAI.

Analyze the partner's digital product business
using ONLY the data provided below.

Rules:

- Never invent data.
- Never change numerical values.
- Do not mention customer information.
- Give concise and actionable insights.
- Focus on sales, revenue, products and growth.
- Return ONLY valid JSON.

Required JSON format:

{
  "summary": "short overall performance summary",

  "insights": [
    {
      "type": "positive | warning | neutral",
      "title": "short title",
      "description": "short explanation"
    }
  ],

  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ],

  "topProduct": {
    "title": "product title",
    "reason": "why this product performs well"
  },

  "growthOpportunity": "main growth opportunity"
}

PARTNER:
${JSON.stringify(data.partner)}

SUMMARY:
${JSON.stringify(data.summary)}

PRODUCTS:
${JSON.stringify(data.products)}

ORDERS:
${JSON.stringify(data.orders)}
`;

// ==========================================
// PARSE RESPONSE
// ==========================================

const parseResponse = (
  content: unknown
): AIAnalytics => {

  if (typeof content !== "string") {
    throw new Error("Invalid AI response");
  }

  const json = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(json) as AIAnalytics;
};

// ==========================================
// ANALYTICS AGENT
// ==========================================

export const runAnalyticsAgent = async (
  data: AnalyticsData
): Promise<AIAnalytics> => {

  try {

    console.log("Using Groq...");

    const response =
      await groq.invoke(
        prompt(data)
      );

    return parseResponse(
      response.content
    );

  } catch (error) {

    console.error(
      "Groq failed:",
      error
    );

    throw new Error(
      "AI analytics generation failed"
    );
  }
};