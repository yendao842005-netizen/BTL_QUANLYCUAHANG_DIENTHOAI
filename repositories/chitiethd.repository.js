import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const ChiTietHoaDonRepository = {
  // Lấy chi tiết theo ID (Khóa chính)
  getById: async (ID) => {
    logger.info(`Repository: Fetching ChiTietHoaDon with ID ${ID}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM ChiTietHoaDon WHERE ID = ?", [ID]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getById failed for ID ${ID}`, err);
      throw err;
    }
  },

  // Lấy tất cả chi tiết của một Hóa Đơn cụ thể
  getByMaHD: async (MaHD) => {
    logger.info(`Repository: Fetching items for HoaDon ${MaHD}`);
    try {
      const db = await pool;
      // Join để lấy tên sản phẩm
      const query = `
        SELECT cthd.*, sp.TenSanPham 
        FROM ChiTietHoaDon cthd
        JOIN SanPham sp ON cthd.MaSP = sp.MaSP
        WHERE cthd.MaHD = ?
      `;
      const [rows] = await db.query(query, [MaHD]);
      return rows;
    } catch (err) {
      logger.error(`Repository Error: getByMaHD failed for MaHD ${MaHD}`, err);
      throw err;
    }
  },

  create: async ({ MaHD, MaSP, SoLuong, DonGia }) => {
    logger.info(`Repository: Creating ChiTietHoaDon for HD ${MaHD} - SP ${MaSP}`);
    try {
      const db = await pool;
      // Không cần insert ThanhTien vì là cột Generated
      // Không cần insert ID vì là Auto Increment
      await db.query(
        "INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong, DonGia) VALUES (?, ?, ?, ?)",
        [MaHD, MaSP, SoLuong, DonGia]
      );
      return { MaHD, MaSP, SoLuong, DonGia };
    } catch (err) {
      logger.error("Repository Error: create ChiTietHoaDon failed", err);
      throw err;
    }
  },

  update: async (ID, { SoLuong, DonGia }) => {
    logger.info(`Repository: Updating ChiTietHoaDon ID ${ID}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE ChiTietHoaDon SET SoLuong = ?, DonGia = ? WHERE ID = ?",
        [SoLuong, DonGia, ID]
      );
      return { ID, SoLuong, DonGia };
    } catch (err) {
      logger.error(`Repository Error: update ChiTietHoaDon failed for ID ${ID}`, err);
      throw err;
    }
  },

  delete: async (ID) => {
    logger.info(`Repository: Deleting ChiTietHoaDon ID ${ID}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM ChiTietHoaDon WHERE ID = ?", [ID]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete ChiTietHoaDon failed for ID ${ID}`, err);
      throw err;
    }
  },
  
  // Xóa toàn bộ chi tiết của 1 hóa đơn (Dùng khi xóa hóa đơn)
  deleteByMaHD: async (MaHD) => {
    logger.info(`Repository: Deleting all items for HoaDon ${MaHD}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM ChiTietHoaDon WHERE MaHD = ?", [MaHD]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: deleteByMaHD failed for MaHD ${MaHD}`, err);
      throw err;
    }
  }
};