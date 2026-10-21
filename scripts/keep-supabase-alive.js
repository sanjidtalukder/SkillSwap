const { Client } = require("pg");

async function pingDatabase() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ Error: DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔌 Connecting to Supabase database...");
    await client.connect();
    
    const startTime = Date.now();
    const res = await client.query("SELECT NOW() as current_time, 1 as status;");
    const duration = Date.now() - startTime;

    console.log("✅ Successfully pinged database!");
    console.log(`⏱️ Query executed in ${duration}ms`);
    console.log(`🕒 Server Time: ${res.rows[0].current_time}`);
    console.log("🎉 Supabase project is kept active!");
  } catch (error) {
    console.error("❌ Failed to query database:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

pingDatabase();
