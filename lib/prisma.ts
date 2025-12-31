/**
 * Prisma Client singleton with SQLite adapter
 *
 * Prisma 7 requires an adapter for SQLite databases.
 * This uses better-sqlite3 for local SQLite support.
 */

import { PrismaClient } from "@/lib/generated/prisma";
import Database from "better-sqlite3";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// Determine database path from environment or default
const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./dev.db";
const absoluteDbPath = path.resolve(process.cwd(), dbPath);

// Create SQLite database connection
const database = new Database(absoluteDbPath);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaBetterSqlite3(database as any);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
