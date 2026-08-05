import { Db, MongoClient } from "mongodb";

// Dynamic import wrapper that returns the appropriate implementation
const mongodbWrapper = {
  getMongoClient: async (): Promise<MongoClient> => {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      const mockModule = await import('./mongodb.mock');
      return mockModule.getMongoClient();
    } else {
      const runtimeModule = await import('./mongodb.runtime');
      return runtimeModule.getMongoClient();
    }
  },
  getMongoDb: async (databaseName?: string): Promise<Db> => {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      const mockModule = await import('./mongodb.mock');
      return mockModule.getMongoDb();
    } else {
      const runtimeModule = await import('./mongodb.runtime');
      return runtimeModule.getMongoDb(databaseName);
    }
  }
};

export const getMongoClient = mongodbWrapper.getMongoClient;
export const getMongoDb = mongodbWrapper.getMongoDb;