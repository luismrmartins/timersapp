import "server-only";
import { Redis } from "@upstash/redis";

// The Upstash Marketplace integration on Vercel exposes the connection
// under the legacy KV_REST_API_* names; the standalone Upstash setup
// uses UPSTASH_REDIS_REST_*. Accept either so this works in both cases.
const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

export const redis = new Redis({ url, token });
