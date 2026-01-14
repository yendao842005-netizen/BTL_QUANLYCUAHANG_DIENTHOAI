import mysql from "mysql2/promise";
import "dotenv/config";
import { logger } from "./logger.js";

const connectionOptions = process.env.MYSQL_URI ?? {
  host: process.env.MYSQL_HOST || "localhost",
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USERNAME || "root",
  password: process.env.MYSQL_PASSWORD || "root",
  database: process.env.MYSQL_DBNAME || "qlch_dien_thoai1",
  dateStrings: true,
};

export const pool = mysql.createPool(connectionOptions);

pool
  .getConnection()
  .then(() => logger.info("MySQL connected successfully"))
  .catch((err) => logger.error("MySQL connection failed", err));
