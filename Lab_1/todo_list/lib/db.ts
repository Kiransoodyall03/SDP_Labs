import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// The database file lives in the project root so a fresh clone just works.
// TODO_DB_PATH exists so tests can point at a throwaway file instead.
const DB_PATH = process.env.TODO_DB_PATH ?? path.join(process.cwd(), "todo.db");

let db: DatabaseSync | null = null;

/**
 * Opens the database on first use and applies the schema. Everything runs in
 * one Node process on one machine, so a single shared connection is enough.
 */
export function getDb(): DatabaseSync {
  if (db) return db;

  db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  const schema = fs.readFileSync(
    path.join(process.cwd(), "lib", "schema.sql"),
    "utf8",
  );
  db.exec(schema);

  return db;
}
