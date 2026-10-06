import type { Request, Response } from "express";
import redis from "../../../../shared/redis/redis.js"


import { runAnalyticsAgent } from "../agent/analytics.agent.js";

import type {
  AnalyticsData,
} from "../types/analytics.types.js";


// ==========================================
// CACHE TIME
// ==========================================

const CACHE_TTL = 60 * 10;


// ==========================================
// AI ANALYTICS
// ==========================================

export const getAIAnalytics = async (
  req: Request,
  res: Response
) => {

  try {

    // ======================================
    // PARTNER ID FROM GATEWAY
    // ======================================

    const partnerId =
      req.headers["x-user-id"] as string;

    if (!partnerId) {

      return res.status(401).json({
        success: false,
        message: "UserID header is required",
      });

    }


    // ======================================
    // ANALYTICS DATA
    // ======================================

    const analyticsData =
      req.body as AnalyticsData;


    // ======================================
    // REDIS KEY
    // ======================================

    const cacheKey =
      `ai:analytics:${partnerId}`;


    // ======================================
    // CHECK CACHE
    // ======================================

    const cached =
      await redis.get(cacheKey);

    if (cached) {

      const data =
        JSON.parse(cached);

      const expiresIn =
        await redis.ttl(cacheKey);

      return res.status(200).json({

        success: true,

        cached: true,

        expiresIn,

        data,

      });

    }


    // ======================================
    // GENERATE AI ANALYTICS
    // ======================================

    const ai =
  await runAnalyticsAgent(
    analyticsData
  );


    // ======================================
    // CHART DATA
    // ======================================

    const productPerformance =
      analyticsData.products.map(
        (product) => ({
          productId: product.id,
          product: product.title,
          sales: product.totalSales,
          revenue: product.totalRevenue,
        })
      );


    // ======================================
    // REVENUE TREND
    // ======================================

    const revenueMap:
      Record<string, number> = {};

    analyticsData.orders.forEach(
      (order) => {

        const date =
          new Date(order.createdAt)
            .toISOString()
            .split("T")[0];

        revenueMap[date] =
          (revenueMap[date] ?? 0) +
          order.partnerAmount;

      }
    );


    const revenueTrend =
      Object.entries(revenueMap)
        .sort(([a], [b]) =>
          a.localeCompare(b)
        )
        .map(([date, revenue]) => ({
          date,
          revenue,
        }));


    // ======================================
    // SALES TREND
    // ======================================

    const salesMap:
      Record<string, number> = {};

    analyticsData.orders.forEach(
      (order) => {

        const date =
          new Date(order.createdAt)
            .toISOString()
            .split("T")[0];

        salesMap[date] =
          (salesMap[date] ?? 0) + 1;

      }
    );


    const salesTrend =
      Object.entries(salesMap)
        .sort(([a], [b]) =>
          a.localeCompare(b)
        )
        .map(([date, sales]) => ({
          date,
          sales,
        }));


    // ======================================
    // FINAL DATA
    // ======================================

    const result = {

      summary:
        analyticsData.summary,

      charts: {

        productPerformance,

        revenueTrend,

        salesTrend,

      },

      ai

    };


    // ======================================
    // SAVE TO REDIS
    // ======================================

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      CACHE_TTL
    );


    // ======================================
    // RESPONSE
    // ======================================

    return res.status(200).json({

      success: true,

      cached: false,

      expiresIn: CACHE_TTL,

      data: result,

    });

  } catch (error) {

    console.error(
      "AI Analytics Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to generate AI analytics",

    });

  }
};