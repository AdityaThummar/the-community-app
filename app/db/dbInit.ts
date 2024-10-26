import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongooseUri = process.env.MONGODB_URL ?? "";
const dbName = process.env.MONGODB_DBNAME ?? "";

mongoose
  .connect(mongooseUri, {
    dbName,
  })
  .then(() => {
    console.log("connected to mongoose");
  })
  .catch((err) => {
    console.log("🚀 ~ mongoose ~ err:", err);
  })
  .finally(() => {
    console.log("done mongo init");
  });
