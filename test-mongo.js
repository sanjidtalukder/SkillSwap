const { getMongoClient } = require("../src/lib/mongodb-wrapper");

async function test() {
  try {
    const client = await getMongoClient();
    console.log("✅ Connected!");

    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping Success");
  } catch (err) {
    console.error("FULL ERROR:");
    console.error(err);
  }
}

test();