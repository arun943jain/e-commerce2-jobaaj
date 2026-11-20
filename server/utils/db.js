import mongoose from "mongoose";

export const DEFAULT_DB_NAME = "ecommerce_2";

export const parseDatabaseName = (mongoUrl) => {
  if (typeof mongoUrl !== "string") {
    return "";
  }

  const withoutQuery = mongoUrl.split("?")[0];
  const withoutScheme = withoutQuery.replace(/^mongodb(\+srv)?:\/\//, "");
  const pathStart = withoutScheme.indexOf("/");

  if (pathStart === -1) {
    return "";
  }

  const path = withoutScheme.slice(pathStart + 1).split("/")[0];

  try {
    return decodeURIComponent(path).trim();
  } catch {
    return "";
  }
};

export const databaseOptions = (mongoUrl, dbName) => {
  const explicitName = typeof dbName === "string" ? dbName.trim() : "";

  if (explicitName) {
    return { dbName: explicitName };
  }

  if (parseDatabaseName(mongoUrl)) {
    return {};
  }

  return { dbName: DEFAULT_DB_NAME };
};

const connectDb = async () => {
  await mongoose.connect(
    process.env.MONGO_URL,
    databaseOptions(process.env.MONGO_URL, process.env.MONGO_DB_NAME)
  );

  console.log("DB connected successfully");
};

export default connectDb;
