import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const DanhMucRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all DanhMuc");
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM DanhMuc");
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll DanhMuc failed", err);
      throw err;
    }
  },

  getByMa: async (MaDM) => {
    logger.info(`Repository: Fetching DanhMuc with MaDM ${MaDM}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM DanhMuc WHERE MaDM = ?", [MaDM]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaDM ${MaDM}`, err);
      throw err;
    }
  },
  // 1. Tìm kiếm tương đối theo tên danh mục
  searchByName: async (ten) => {
    logger.info(`Repository: Searching DanhMuc by name: ${ten}`);
    try {
      const db = await pool;
      const query = "SELECT * FROM DanhMuc WHERE TenDanhMuc LIKE ?";
      const [rows] = await db.query(query, [`%${ten}%`]);
      return rows;
    } catch (err) {
      logger.error("Repository Error: searchByName failed", err);
      throw err;
    }
  },

  // 2. Lấy dữ liệu phân trang
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching DanhMuc with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;
      // Lấy dữ liệu trang hiện tại
      const queryData = "SELECT * FROM DanhMuc LIMIT ? OFFSET ?";
      const [rows] = await db.query(queryData, [limit, offset]);
      
      // Đếm tổng số bản ghi
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM DanhMuc");
      
      return {
        danhMucs: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },
  create: async ({ MaDM, TenDanhMuc, MoTa }) => {
    logger.info(`Repository: Creating DanhMuc ${MaDM}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO DanhMuc (MaDM, TenDanhMuc, MoTa) VALUES (?, ?, ?)",
        [MaDM, TenDanhMuc, MoTa]
      );
      return { MaDM, TenDanhMuc,MoTa };
    } catch (err) {
      logger.error("Repository Error: create DanhMuc failed", err);
      throw err;
    }
  },

  update: async (MaDM, { TenDanhMuc, MoTa }) => {
    logger.info(`Repository: Updating DanhMuc ${MaDM}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE DanhMuc SET TenDanhMuc = ?, MoTa = ? WHERE MaDM = ?",
        [TenDanhMuc, MoTa, MaDM]
      );
      return { MaDM, TenDanhMuc,MoTa };
    } catch (err) {
      logger.error(`Repository Error: update DanhMuc failed for MaDM ${MaDM}`, err);
      throw err;
    }
  },

  delete: async (MaDM) => {
    logger.info(`Repository: Deleting DanhMuc ${MaDM}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM DanhMuc WHERE MaDM = ?", [MaDM]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete DanhMuc failed for MaDM ${MaDM}`, err);
      throw err;
    }
  },
};