import dotenv from "dotenv";

dotenv.config();

const VALID_NODE_ENVS = ["development", "test", "production"];
const problems = [];
const NODE_ENV = (process.env.NODE_ENV ?? "development").trim();

if (!VALID_NODE_ENVS.includes(NODE_ENV)) {
  problems.push(`NODE_ENV must be one of ${VALID_NODE_ENVS.join(", ")} (received "${NODE_ENV}")`);
}

const readString = (key, { fallback = "", required = false, minLength = 0 } = {}) => {
  const value = (process.env[key] ?? "").trim();

  if (!value) {
    if (required) problems.push(`${key} is required but missing or empty`);
    return fallback;
  }

  if (minLength > 0 && value.length < minLength) problems.push(`${key} must be at least ${minLength} characters long`);
  return value;
};

const readInteger = (key, { fallback, min, max }) => {
  const raw = readString(key, { fallback: String(fallback) });
  const value = Number(raw);

  if (!Number.isInteger(value) || value < min || value > max) {
    problems.push(`${key} must be an integer between ${min} and ${max} (received "${raw}")`);
    return fallback;
  }

  return value;
};

const readOriginList = (key, fallback) => {
  const origins = readString(key, { fallback }).split(",").map((origin) => origin.trim()).filter(Boolean);

  for (const origin of origins) {
    try { new URL(origin); } catch { problems.push(`${key} contains an invalid URL: "${origin}"`); }
  }

  return origins;
};

const isProduction = NODE_ENV === "production";
const clientOrigins = readOriginList("CLIENT_URL", "http://localhost:5173");

export const env = Object.freeze({
  NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === "development",
  isTest: NODE_ENV === "test",
  PORT: readInteger("PORT", { fallback: 5000, min: 1, max: 65535 }),
  API_PREFIX: "/api/v1",
  MONGODB_URI: readString("MONGODB_URI", { required: NODE_ENV !== "test" }),
  JWT_SECRET: readString("JWT_SECRET", { required: NODE_ENV !== "test", minLength: isProduction ? 32 : 0 }),
  JWT_EXPIRES_IN: readString("JWT_EXPIRES_IN", { fallback: "1d" }),
  CLIENT_ORIGINS: Object.freeze(clientOrigins),
  CLIENT_URL: clientOrigins[0] ?? "http://localhost:5173",
  RATE_LIMIT_WINDOW_MS: readInteger("RATE_LIMIT_WINDOW_MS", { fallback: 900000, min: 1000, max: 86400000 }),
  RATE_LIMIT_MAX: readInteger("RATE_LIMIT_MAX", { fallback: isProduction ? 300 : 2000, min: 1, max: 1000000 }),
});

if (problems.length > 0) {
  throw new Error(`Invalid environment configuration:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
}

export default env;
