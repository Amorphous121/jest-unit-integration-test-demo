import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo = null;

export const connectDatabase = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
};
