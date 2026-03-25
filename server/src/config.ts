import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import type { Knex } from "knex";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export function getDbConfig(): Knex.Config {
  const client = process.env.DB_CLIENT || "better-sqlite3";

  if (client === "better-sqlite3") {
    return {
      client: "better-sqlite3",
      connection: {
        filename: process.env.DB_FILENAME || path.resolve(__dirname, "../data.db"),
      },
      useNullAsDefault: true,
    };
  }

  // MySQL / MariaDB
  return {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "repurposing_dashboard",
    },
    pool: { min: 2, max: 10 },
  };
}
