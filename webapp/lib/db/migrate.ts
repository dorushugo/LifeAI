import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import fs from "fs";

config({
  path: ".env",
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is not defined");
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log("⏳ Running migrations...");

  const migrationsFolder = "./lib/db/migrations";
  console.log(`📂 Checking migrations folder: ${migrationsFolder}`);

  const migrationFiles = fs.readdirSync(migrationsFolder);
  console.log(`📄 Found migration files: ${migrationFiles.join(", ")}`);

  const start = Date.now();
  await migrate(db, { migrationsFolder });
  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});
