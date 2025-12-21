import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const TaiKhoanRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all TaiKhoan");
    try {
      const db = await pool;
      // Join để lấy thêm tên nhân viên cho dễ quản lý
      const query = `
        select * from TaiKhoan
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll TaiKhoan failed", err);
      throw err;
    }
  },

  getByMa: async (MaTK) => {
    logger.info(`Repository: Fetching TaiKhoan with MaTK ${MaTK}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM TaiKhoan WHERE MaTK = ?", [MaTK]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaTK ${MaTK}`, err);
      throw err;
    }
  },

  getByMaNV: async (MaNV) => {
    logger.info(`Repository: Fetching TaiKhoan for MaNV ${MaNV}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM TaiKhoan WHERE MaNV = ?", [MaNV]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMaNV failed`, err);
      throw err;
    }
  },

  // Tìm theo tên đăng nhập (Dùng cho Login)
  getByTenDangNhap: async (TenDangNhap) => {
    logger.info(`Repository: Fetching TaiKhoan with Username ${TenDangNhap}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM TaiKhoan WHERE TenDangNhap = ?", [TenDangNhap]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByTenDangNhap failed`, err);
      throw err;
    }
  },

  // Lấy dữ liệu phân trang và tổng số lượng
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching TaiKhoan with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;
      
      // Truy vấn lấy dữ liệu theo trang
      const queryData = "SELECT * FROM TaiKhoan LIMIT ? OFFSET ?";
      const [rows] = await db.query(queryData, [limit, offset]);
      
      // Truy vấn đếm tổng số bản ghi để tính tổng số trang
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM TaiKhoan");
      
      return {
        taiKhoans: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },

  
  create: async ({ MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai,NgayTao }) => {
    logger.info(`Repository: Creating TaiKhoan ${MaTK}`);
    try {
      const db = await pool;
      // Lưu ý: MatKhau truyền vào ở đây nên được hash MD5 trước hoặc hash tại service
      await db.query(
        "INSERT INTO TaiKhoan (MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai,NgayTao) VALUES (?, ?, ?, ?, ?, ?,?)",
        [MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai,NgayTao]
      );
      return { MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai,NgayTao };
    } catch (err) {
      logger.error("Repository Error: create TaiKhoan failed", err);
      throw err;
    }
  },

  update: async (MaTK, {TenDangNhap, MatKhau, QuyenHan, TrangThai }) => {
    logger.info(`Repository: Updating TaiKhoan ${MaTK}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE TaiKhoan SET TenDangNhap = ?, MatKhau = ?, QuyenHan = ?, TrangThai = ? WHERE MaTK = ?",
        [TenDangNhap,MatKhau, QuyenHan, TrangThai, MaTK]
      );
      return { MaTK ,TenDangNhap,MatKhau, QuyenHan, TrangThai};
    } catch (err) {
      logger.error(`Repository Error: update TaiKhoan failed for MaTK ${MaTK}`, err);
      throw err;
    }
  },

  delete: async (MaTK) => {
    logger.info(`Repository: Deleting TaiKhoan ${MaTK}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM TaiKhoan WHERE MaTK = ?", [MaTK]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete TaiKhoan failed for MaTK ${MaTK}`, err);
      throw err;
    }
  },
};