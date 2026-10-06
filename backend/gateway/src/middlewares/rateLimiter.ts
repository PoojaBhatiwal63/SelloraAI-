import type { Request, Response, NextFunction } from "express";
import redis from "../../../shared/redis/redis.js"

const WINDOW = 60; // 1 minute

const LIMITS = {
  auth: 20,
  products: 100,
  orders: 20,
  ai: 5,
  default: 60,
} as const;

const getClientKey = (req: Request): string => {
  const userId = req.headers["x-user-id"];

  if (typeof userId === "string" && userId.length > 0) {
    return `user:${userId}`;
  }

  return `ip:${req.ip}`;
};

const getLimit = (req: Request): number => {
  const path = req.originalUrl;

  if (path.startsWith("/api/auth")) {
    return LIMITS.auth;
  }

  if (path.startsWith("/api/product")) {
    return LIMITS.products;
  }

  if (path.startsWith("/api/order")) {
    return LIMITS.orders;
  }

  if (path.startsWith("/api/ai")) {
    return LIMITS.ai;
  }

  return LIMITS.default;
};

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientKey = getClientKey(req);
    const limit = getLimit(req);

    const route =
      req.path.split("/")[2] || "default";

    const key =
      `rate-limit:${route}:${clientKey}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW);
    }

    const ttl = await redis.ttl(key);

    res.setHeader(
      "X-RateLimit-Limit",
      limit
    );

    res.setHeader(
      "X-RateLimit-Remaining",
      Math.max(limit - count, 0)
    );

    res.setHeader(
      "X-RateLimit-Reset",
      ttl
    );

    if (count > limit) {
      return res.status(429).json({
        success: false,
        message:
          "Too many requests. Please try again later.",
        retryAfter: ttl,
      });
    }

    next();
  } catch (error) {
    console.error(
      "Rate limiter error:",
      error
    );

    // Redis fail hone par request ko block nahi karenge
    next();
  }
};