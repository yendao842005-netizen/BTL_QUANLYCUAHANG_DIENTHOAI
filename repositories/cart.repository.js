import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const CartRepository = {
  // Thêm hoặc Cập nhật (Upsert)
  upsertItem: async (maTK, maSP, soLuong) => {
    logger.info(`Repository: Upserting Cart Item for User ${maTK} - SP ${maSP}`);
    try {
      const db = await pool;
      // Logic: Nếu chưa có thì Insert, có rồi thì cộng thêm số lượng
      const sql = `
        INSERT INTO GioHang (MaTK, MaSP, SoLuong) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE SoLuong = SoLuong + VALUES(SoLuong)
      `;
      await db.query(sql, [maTK, maSP, soLuong]);
      return { maTK, maSP, soLuong };
    } catch (err) {
      logger.error(`Repository Error: upsertItem failed for User ${maTK}`, err);
      throw err;
    }
  },

  // Lấy danh sách giỏ hàng
  getCartByUserId: async (maTK) => {
    try {
      const db = await pool;
      
      // [ĐÃ SỬA] ĐIỀN CÂU LỆNH SQL ĐẦY ĐỦ VÀO ĐÂY
      const sql = `
        SELECT 
            gh.MaSP, 
            gh.SoLuong, 
            sp.TenSanPham, 
            sp.HinhAnh, 
            sp.GiaBan,
            sp.SoLuongTon
        FROM GioHang gh
        JOIN SanPham sp ON gh.MaSP = sp.MaSP
        WHERE gh.MaTK = ?
      `;
      
      const [rows] = await db.query(sql, [maTK]);
      
      // Trả về mảng (dù rỗng) để Service không bị lỗi .map()
      return rows || []; 
    } catch (err) {
      logger.error(`Repository Error: getCartByUserId failed for User ${maTK}`, err);
      throw err;
    }
  },

  // Cập nhật số lượng cụ thể
  updateQuantity: async (maTK, maSP, soLuong) => {
    logger.info(`Repository: Updating quantity User ${maTK} - SP ${maSP} to ${soLuong}`);
    try {
      const db = await pool;
      await db.query("UPDATE GioHang SET SoLuong = ? WHERE MaTK = ? AND MaSP = ?", [soLuong, maTK, maSP]);
      return { maTK, maSP, soLuong };
    } catch (err) {
      logger.error(`Repository Error: updateQuantity failed`, err);
      throw err;
    }
  },

  // Xóa 1 sản phẩm
  removeItem: async (maTK, maSP) => {
    logger.info(`Repository: Removing Item User ${maTK} - SP ${maSP}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM GioHang WHERE MaTK = ? AND MaSP = ?", [maTK, maSP]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: removeItem failed`, err);
      throw err;
    }
  },

  // Xóa sạch giỏ
  clearCart: async (maTK) => {
    logger.info(`Repository: Clearing Cart for User ${maTK}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM GioHang WHERE MaTK = ?", [maTK]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: clearCart failed`, err);
      throw err;
    }
  }
};