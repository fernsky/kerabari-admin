import dotenv from "dotenv";
import * as Minio from "minio";

dotenv.config();

export const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  accessKey: "vxCBvi9afFOcZDLDsGcW",
  secretKey: "OiflNRpMF6LZoeeJpBdnU8kNhXKEDjLiRoM2bfdH",
  useSSL: false,
});
