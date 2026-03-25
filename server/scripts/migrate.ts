import db from "../src/db.js";

async function migrate() {
  console.log("Running migrations...");
  const [batch, log] = await db.migrate.latest({
    directory: new URL("../migrations", import.meta.url).pathname,
  });
  if (log.length === 0) {
    console.log("Already up to date.");
  } else {
    console.log(`Batch ${batch}: ${log.length} migration(s) applied.`);
    log.forEach((name: string) => console.log(`  - ${name}`));
  }
  await db.destroy();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
