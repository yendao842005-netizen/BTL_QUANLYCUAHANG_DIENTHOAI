import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const NhaCungCapRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all NhaCungCap");
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM NhaCungCap");
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll NhaCungCap failed", err);
      throw err;
    }
  },

  getByMa: async (MaNCC) => {
    logger.info(`Repository: Fetching NhaCungCap with MaNCC ${MaNCC}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM NhaCungCap WHERE MaNCC = ?", [MaNCC]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaNCC ${MaNCC}`, err);
      throw err;
    }
  },
  // Tìm kiếm nâng cao (theo tên, người liên hệ, địa chỉ)
  searchAdvanced: async ({ ten, nguoiLienHe, diaChi }) => {
    logger.info("Repository: Advanced searching NhaCungCap");
    try {
      const db = await pool;
      let query = "SELECT * FROM NhaCungCap WHERE 1=1";
      const params = [];

      if (ten) {
        query += " AND TenNhaCungCap LIKE ?";
        params.push(`%${ten}%`);
      }
      if (nguoiLienHe) {
        query += " AND NguoiLienHe LIKE ?";
        params.push(`%${nguoiLienHe}%`);
      }
      if (diaChi) {
        query += " AND DiaChi LIKE ?";
        params.push(`%${diaChi}%`);
      }

      const [rows] = await db.query(query, params);
      return rows;
    } catch (err) {
      logger.error("Repository Error: searchAdvanced failed", err);
      throw err;
    }
  },

  // Lấy dữ liệu phân trang
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching NhaCungCap with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;
      const queryData = "SELECT * FROM NhaCungCap LIMIT ? OFFSET ?";
      const [rows] = await db.query(queryData, [limit, offset]);
      
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM NhaCungCap");
      
      return {
        nhaCungCaps: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },

  create: async ({ MaNCC, TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi }) => {
    logger.info(`Repository: Creating NhaCungCap ${MaNCC}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO NhaCungCap (MaNCC, TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi) VALUES (?, ?, ?, ?, ?)",
        [MaNCC, TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi]
      );
      return { MaNCC, TenNhaCungCap , NguoiLienHe, SoDienThoai, DiaChi};
    } catch (err) {
      logger.error("Repository Error: create NhaCungCap failed", err);
      throw err;
    }
  },

  update: async (MaNCC, { TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi }) => {
    logger.info(`Repository: Updating NhaCungCap ${MaNCC}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE NhaCungCap SET TenNhaCungCap = ?, NguoiLienHe = ?, SoDienThoai = ?, DiaChi = ? WHERE MaNCC = ?",
        [TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi, MaNCC]
      );
      return { MaNCC, TenNhaCungCap , NguoiLienHe, SoDienThoai, DiaChi};
    } catch (err) {
      logger.error(`Repository Error: update NhaCungCap failed for MaNCC ${MaNCC}`, err);
      throw err;
    }
  },

  delete: async (MaNCC) => {
    logger.info(`Repository: Deleting NhaCungCap ${MaNCC}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM NhaCungCap WHERE MaNCC = ?", [MaNCC]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete NhaCungCap failed for MaNCC ${MaNCC}`, err);
      throw err;
    }
  },
};