import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const HoaDonRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all HoaDon");
    try {
      const db = await pool;
      // Join để lấy tên khách hàng và nhân viên
      const query = `
        SELECT * from HoaDon
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll HoaDon failed", err);
      throw err;
    }
  },

  getByMa: async (MaHD) => {
    logger.info(`Repository: Fetching HoaDon with MaHD ${MaHD}`);
    try {
      const db = await pool;
      const query = `
        SELECT hd.*, kh.HoTen as TenKhachHang, nv.HoTen as TenNhanVien 
        FROM HoaDon hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
        WHERE hd.MaHD = ?
      `;
      const [rows] = await db.query(query, [MaHD]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaHD ${MaHD}`, err);
      throw err;
    }
  },

  // 1. Phân trang hóa đơn
  getPaginated: async (offset, limit) => {
    try {
      const db = await pool; //
      const query = "SELECT * FROM HoaDon  LIMIT ? OFFSET ?";
      const [rows] = await db.query(query, [limit, offset]);
      const [count] = await db.query("SELECT COUNT(*) as total FROM HoaDon");
      return { data: rows, total: count[0].total };
    } catch (err) { throw err; }
  },

  // 2. Tìm kiếm theo khoảng thời gian (Lọc doanh thu)
  filterByDate: async (startDate, endDate) => {
    try {
      const db = await pool; //
      const query = "SELECT * FROM HoaDon WHERE NgayLap BETWEEN ? AND ?";
      const [rows] = await db.query(query, [startDate, endDate]);
      return rows;
    } catch (err) { throw err; }
  },

  // 3. Thống kê tổng doanh thu theo tháng của năm hiện tại
  getMonthlyRevenue: async (year) => {
    try {
      const db = await pool; //
      const query = `
        SELECT MONTH(NgayLap) as Thang, SUM(TongTien) as DoanhThu 
        FROM HoaDon 
        WHERE YEAR(NgayLap) = ? AND TrangThai = 'HoanThanh' 
        GROUP BY MONTH(NgayLap)
      `;
      const [rows] = await db.query(query, [year]);
      return rows;
    } catch (err) { throw err; }
  },

  create: async ({ MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu }) => {
    logger.info(`Repository: Creating HoaDon ${MaHD}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO HoaDon (MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu]
      );
      return { MaHD,MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu };
    } catch (err) {
      logger.error("Repository Error: create HoaDon failed", err);
      throw err;
    }
  },

  update: async (MaHD, { TongTien, TrangThai, GhiChu }) => {
    logger.info(`Repository: Updating HoaDon ${MaHD}`);
    try {
      const db = await pool;
      // Hóa đơn thường chỉ update trạng thái, tổng tiền hoặc ghi chú
      await db.query(
        "UPDATE HoaDon SET TongTien = ?, TrangThai = ?, GhiChu = ? WHERE MaHD = ?",
        [TongTien, TrangThai, GhiChu, MaHD]
      );
      return { MaHD,TongTien, TrangThai, GhiChu };
    } catch (err) {
      logger.error(`Repository Error: update HoaDon failed for MaHD ${MaHD}`, err);
      throw err;
    }
  },

  delete: async (MaHD) => {
    logger.info(`Repository: Deleting HoaDon ${MaHD}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM HoaDon WHERE MaHD = ?", [MaHD]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete HoaDon failed for MaHD ${MaHD}`, err);
      throw err;
    }
  },
};