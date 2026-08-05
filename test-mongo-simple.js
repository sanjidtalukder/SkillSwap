const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function test() {
  console.log("Testing MongoDB connection...");

  if (!uri) {
    console.log("MONGODB_URI is not set in environment variables");
    return;
  }

  console.log("URI:", uri.replace(/:[^@]+@/, ':*****@'));

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ Connected!");

    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping Success");

    await client.close();
  } catch (err) {
    console.error("FULL ERROR:");
    console.error(err);
  }
}

test();