import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const KhachHangRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all KhachHang");
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM KhachHang");
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll KhachHang failed", err);
      throw err;
    }
  },

  getByMa: async (MaKH) => {
    logger.info(`Repository: Fetching KhachHang with MaKH ${MaKH}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM KhachHang WHERE MaKH = ?", [MaKH]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaKH ${MaKH}`, err);
      throw err;
    }
  },
  // Tìm kiếm nâng cao (tên, số điện thoại, địa chỉ, email)
  searchAdvanced: async ({ hoTen, soDienThoai, diaChi, email }) => {
    logger.info("Repository: Advanced searching KhachHang");
    try {
      const db = await pool;
      let query = "SELECT * FROM KhachHang WHERE 1=1";
      const params = [];

      if (hoTen) {
        query += " AND HoTen LIKE ?";
        params.push(`%${hoTen}%`);
      }
      if (soDienThoai) {
        query += " AND SoDienThoai LIKE ?";
        params.push(`%${soDienThoai}%`);
      }
      if (diaChi) {
        query += " AND DiaChi LIKE ?";
        params.push(`%${diaChi}%`);
      }
      if (email) {
        query += " AND Email LIKE ?";
        params.push(`%${email}%`);
      }

      const [rows] = await db.query(query, params);
      return rows;
    } catch (err) {
      logger.error("Repository Error: searchAdvanced KhachHang failed", err);
      throw err;
    }
  },

  // Lấy dữ liệu phân trang
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching KhachHang with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;
      const queryData = "SELECT * FROM KhachHang LIMIT ? OFFSET ?";
      const [rows] = await db.query(queryData, [limit, offset]);
      
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM KhachHang");
      
      return {
        khachHangs: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated KhachHang failed", err);
      throw err;
    }
  },
    
  create: async ({ MaKH, HoTen, SoDienThoai, DiaChi, Email }) => {
    logger.info(`Repository: Creating KhachHang ${MaKH}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO KhachHang (MaKH, HoTen, SoDienThoai, DiaChi, Email) VALUES (?, ?, ?, ?, ?)",
        [MaKH, HoTen, SoDienThoai, DiaChi, Email]
      );
      return { MaKH, HoTen };
    } catch (err) {
      logger.error("Repository Error: create KhachHang failed", err);
      throw err;
    }
  },

  update: async (MaKH, { HoTen, SoDienThoai, DiaChi, Email }) => {
    logger.info(`Repository: Updating KhachHang ${MaKH}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE KhachHang SET HoTen = ?, SoDienThoai = ?, DiaChi = ?, Email = ? WHERE MaKH = ?",
        [HoTen, SoDienThoai, DiaChi, Email, MaKH]
      );
      return { MaKH, HoTen, SoDienThoai, DiaChi, Email };
    } catch (err) {
      logger.error(`Repository Error: update KhachHang failed for MaKH ${MaKH}`, err);
      throw err;
    }
  },

  delete: async (MaKH) => {
    logger.info(`Repository: Deleting KhachHang ${MaKH}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM KhachHang WHERE MaKH = ?", [MaKH]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete KhachHang failed for MaKH ${MaKH}`, err);
      throw err;
    }
  },
};