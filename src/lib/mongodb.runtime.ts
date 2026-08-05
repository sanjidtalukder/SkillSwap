import { Db, MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "skillswap";

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const options = {
  appName: "SkillSwap",
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

if (process.env.NODE_ENV !== "production") {
  globalThis._mongoClientPromise = clientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, options).connect();
    if (process.env.NODE_ENV !== "production") {
      globalThis._mongoClientPromise = clientPromise;
    }
  }
  return clientPromise;
}

export async function getMongoDb(databaseName = dbName): Promise<Db> {
  const client = await getMongoClient();
  return client.db(databaseName);
}