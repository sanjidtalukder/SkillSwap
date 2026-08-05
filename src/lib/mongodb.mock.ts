// Build-time mock for MongoDB
import { MongoClient, Db } from "mongodb";

const mockClient: MongoClient = {
  db: () => ({
    command: async () => ({ ok: 1 }),
  } as unknown as Db),
  connect: async () => mockClient,
  close: async () => {},
  // Add minimal required properties
  options: {},
  topology: null as any,
  s: {
    coreTopology: null as any,
    options: {},
    sessionPool: null as any,
    activeSessions: new Set(),
    getSession: () => null as any,
    endSessions: () => {},
    clusterTime: null as any
  },
  serverApi: undefined,
  driverInfo: { name: "mock", version: "1.0.0" },
  // Implement minimal required methods
  addListener: () => mockClient,
  on: () => mockClient,
  once: () => mockClient,
  removeListener: () => mockClient,
  off: () => mockClient,
  removeAllListeners: () => mockClient,
  setMaxListeners: () => mockClient,
  getMaxListeners: () => 0,
  listeners: () => [],
  rawListeners: () => [],
  emit: () => false,
  listenerCount: () => 0,
  prependListener: () => mockClient,
  prependOnceListener: () => mockClient,
  eventNames: () => []
} as unknown as MongoClient;

export const getMongoClient = async () => mockClient;
export const getMongoDb = async () => mockClient.db();