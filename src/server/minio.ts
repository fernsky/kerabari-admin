import dotenv from "dotenv";
import * as Minio from "minio";

dotenv.config();

export const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  accessKey: process.env.MINIO_ACCESS_KEY || "2EpLIPxSc3ET9oxGESIo",
  secretKey:
    process.env.MINIO_SECRET_KEY || "XX6f9FYdc6ToDMtqgiyOb7EtucNG1KJPrDoCFb1U",
  useSSL: process.env.MINIO_USE_SSL === "true",
});
