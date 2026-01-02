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
  // Sửa lại hàm searchAdvanced
  // 1. SỬA HÀM TÌM KIẾM (Để hiển thị số lượng khi tìm kiếm)
  searchAdvanced: async ({ ten, nguoiLienHe, diaChi, limit, offset }) => {
    logger.info("Repository: Advanced searching NhaCungCap with pagination");
    try {
      const db = await pool;
      
      // ALIAS "n" đại diện cho bảng NhaCungCap
      let whereClause = "WHERE 1=1"; 
      const params = [];

      if (ten) {
        whereClause += " AND n.TenNhaCungCap LIKE ?";
        params.push(`%${ten}%`);
      }
      if (nguoiLienHe) {
        whereClause += " AND n.NguoiLienHe LIKE ?";
        params.push(`%${nguoiLienHe}%`);
      }
      if (diaChi) {
        whereClause += " AND n.DiaChi LIKE ?";
        params.push(`%${diaChi}%`);
      }

      // --- CÂU SQL QUAN TRỌNG ĐÃ SỬA ---
      // Dùng Subquery (SELECT COUNT...) để đếm Sản phẩm cho từng dòng
      const queryData = `
        SELECT 
            n.*,
            (SELECT COUNT(*) FROM SanPham s WHERE s.MaNCC = n.MaNCC) AS SoSanPham
            
        FROM NhaCungCap n
        ${whereClause}
        ORDER BY n.MaNCC ASC
        LIMIT ? OFFSET ?
      `;

      // Thực thi query
      const [rows] = await db.query(queryData, [...params, limit, offset]);

      // Đếm tổng số trang (giữ nguyên logic cũ nhưng thêm alias n cho an toàn)
      const queryCount = `SELECT COUNT(*) as total FROM NhaCungCap n ${whereClause}`;
      const [countResult] = await db.query(queryCount, params);

      return {
        nhaCungCaps: rows,
        totalItems: countResult[0].total
      };
    } catch (err) {
      // Nếu lỗi do chưa có bảng PhieuNhap, code sẽ nhảy vào đây
      // Bạn có thể xóa dòng đếm PhieuNhap ở trên nếu chưa tạo bảng đó
      logger.error("Repository Error: searchAdvanced failed", err);
      throw err;
    }
  },

  // 2. SỬA HÀM PHÂN TRANG (Để hiển thị số lượng khi load trang chủ)
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching NhaCungCap with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;

      // --- CÂU SQL QUAN TRỌNG ĐÃ SỬA ---
      const queryData = `
        SELECT 
            n.*,
            (SELECT COUNT(*) FROM SanPham s WHERE s.MaNCC = n.MaNCC) AS SoSanPham
            
        FROM NhaCungCap n
        ORDER BY n.MaNCC aSC
        LIMIT ? OFFSET ?
      `;
      
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
      return { MaNCC, TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi };
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
      return { MaNCC, TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi };
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

  //  Lấy danh sách sản phẩm thuộc về NCC này
  getProductsBySupplier: async (MaNCC) => {
    logger.info(`Repository: Fetching products for Supplier ${MaNCC}`);
    try {
      const db = await pool;
      const sql = `
        SELECT * FROM SanPham 
        WHERE MaNCC = ?
        
      `;
      const [rows] = await db.query(sql, [MaNCC]);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getProductsBySupplier failed", err);
      throw err;
    }
  },
  //xuat excel
  getAllForExport: async () => {
    const db = await pool;
    const [rows] = await db.query("SELECT * FROM NhaCungCap");
    return rows;
  },

  // --- MỚI: Thống kê tổng quan cho Dashboard ---
  getThongKeTongQuan: async () => {
    logger.info("Repository: Lấy số liệu thống kê tổng quan");
    try {
      const db = await pool;

      const [
        [nccRows],
        [spRows]
      ] = await Promise.all([
        db.query("SELECT COUNT(*) AS total FROM NhaCungCap"),
        db.query("SELECT COUNT(*) AS total FROM SanPham")
      ]);

      return {
        soLuongNCC: nccRows[0]?.total ?? 0,
        soLuongSP: spRows[0]?.total ?? 0
      };
    } catch (err) {
      logger.error("Repository Error: getThongKeTongQuan failed", err);
      return { soLuongNCC: 0, soLuongSP: 0 };
    }
  },
};