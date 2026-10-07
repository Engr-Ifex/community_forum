/*
 * Development seed — role-testing accounts.
 *
 * Creates (or repairs) one admin and one moderator so the role-based UI and the
 * backend middleware can actually be exercised. There is no other way to obtain
 * these roles: registration deliberately rejects a `role` field, so a fresh
 * clone has no admin and the admin console is unreachable.
 *
 * SAFETY
 *   - Refuses to run when NODE_ENV=production. Test credentials must never reach
 *     a production database.
 *   - Idempotent: if the account already exists it is repaired (role reset,
 *     reactivated, password re-hashed only when missing) and reported - it is
 *     never duplicated.
 *   - Uses the same bcrypt cost as the application (12) and the real Mongoose
 *     `User` model, so the documents are ordinary, valid users.
 *   - Passwords are never printed. They live in this file as development
 *     constants and in `docs/`; they are not environment variables and are not
 *     read by the server at runtime.
 *
 * Run explicitly, from the server directory:
 *   npm run seed
 */
import dns from "node:dns";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { env } from "../src/config/env.js";
import User from "../src/models/User.js";

/*
 * Some networks (and some developer machines) have a resolver that cannot
 * follow MongoDB Atlas SRV records, which surfaces as
 * `querySrv ECONNREFUSED _mongodb._tcp.<cluster>`. The long-running server
 * usually resolved at boot and keeps working, but a short-lived script resolves
 * cold every time. Falling back to public resolvers only when the default one
 * fails keeps this script working without changing any application code.
 */
const ensureResolvableDns = async () => {
  const host = env.MONGODB_URI.replace(/^mongodb(\+srv)?:\/\//, "")
    .split("@")
    .pop()
    ?.split("/")[0]
    ?.split(":")[0];

  if (!host || !env.MONGODB_URI.startsWith("mongodb+srv://")) return;

  const probe = () =>
    new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), 5000);

      dns.resolveSrv(`_mongodb._tcp.${host}`, (error) => {
        clearTimeout(timer);
        resolve(!error);
      });
    });

  if (await probe()) return;

  console.warn(
    "Default DNS resolver could not resolve the Atlas SRV record; " +
      "retrying with public resolvers (8.8.8.8, 1.1.1.1).",
  );

  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");
};

/** Development-only fixtures. Not production credentials. */
const TEST_ACCOUNTS = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123!",
    role: "admin",
  },
  {
    name: "Moderator User",
    email: "moderator@example.com",
    password: "Moderator123!",
    role: "moderator",
  },
];

const PASSWORD_SALT_ROUNDS = 12; // must match auth.service.js

const run = async () => {
  if (env.isProduction) {
    console.error(
      "Refusing to run: NODE_ENV=production.\n" +
        "The seed script creates accounts with known passwords and must never " +
        "touch a production database.",
    );
    process.exit(1);
  }

  await ensureResolvableDns();

  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  console.log(`Connected to "${mongoose.connection.name}".\n`);

  const summary = [];

  for (const account of TEST_ACCOUNTS) {
    // `password` is select:false on the schema, so ask for it explicitly.
    const existing = await User.findOne({ email: account.email }).select("+password");

    if (existing) {
      // Repair rather than recreate: keep the _id (and therefore any content
      // already authored by this account) but guarantee the role and an active
      // status, which is what the tests depend on.
      existing.role = account.role;
      existing.isActive = true;

      let passwordChanged = false;

      if (!existing.password) {
        existing.password = await bcrypt.hash(account.password, PASSWORD_SALT_ROUNDS);
        passwordChanged = true;
      }

      await existing.save();

      summary.push({
        status: "exists",
        email: account.email,
        role: account.role,
        id: existing._id.toString(),
        note: passwordChanged
          ? "password was missing and has been set"
          : "unchanged (password left as-is)",
      });

      continue;
    }

    const created = await User.create({
      name: account.name,
      email: account.email,
      password: await bcrypt.hash(account.password, PASSWORD_SALT_ROUNDS),
      role: account.role,
      isActive: true,
    });

    summary.push({
      status: "created",
      email: account.email,
      role: account.role,
      id: created._id.toString(),
      note: "new account",
    });
  }

  console.log("Development role-testing accounts");
  console.log("---------------------------------");

  for (const row of summary) {
    console.log(
      `${row.status === "created" ? "CREATED" : "EXISTS "}  ${row.role.padEnd(9)}  ${row.email.padEnd(24)}  ${row.note}`,
    );
  }

  console.log(
    "\nPasswords are NOT printed. See docs/DEPLOYMENT.md → \"Development test accounts\".",
  );
  console.log("DEVELOPMENT / TESTING ONLY - never use these in production.");

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`\nSeed failed: ${error.message}`);

  if (error.message?.includes("querySrv") || error.code === "ECONNREFUSED") {
    console.error(
      "\nThe database host could not be reached. If you are using MongoDB Atlas,\n" +
        "this machine's DNS resolver may be unable to resolve the SRV record.\n" +
        "Check MONGODB_URI in server/.env, or use a local MongoDB instance.",
    );
  }

  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
