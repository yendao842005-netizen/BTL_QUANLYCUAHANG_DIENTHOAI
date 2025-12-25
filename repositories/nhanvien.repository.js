import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const NhanVienRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all NhanVien");
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM NhanVien");
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll NhanVien failed", err);
      throw err;
    }
  },

  getByMa: async (MaNV) => {
    logger.info(`Repository: Fetching NhanVien with MaNV ${MaNV}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM NhanVien WHERE MaNV = ?", [MaNV]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaNV ${MaNV}`, err);
      throw err;
    }
  },


  searchAdvanced: async ({ hoTen, tuNgaySinh, gioiTinh, diaChi, chucVu }) => {
    logger.info("Repository: Advanced searching NhanVien");
    try {
      const db = await pool;
      let query = "SELECT * FROM NhanVien WHERE 1=1";
      const params = [];

      // 1. Tìm theo tên (tương đối)
      if (hoTen) {
        query += " AND HoTen LIKE ?";
        params.push(`%${hoTen}%`);
      }

      // 2. Tìm theo ngày sinh từ thời điểm nhập đến hiện tại
      if (tuNgaySinh) {
        query += " AND NgaySinh BETWEEN ? AND CURRENT_DATE()";
        params.push(tuNgaySinh);
      }

      // 3. Tìm theo giới tính
      if (gioiTinh) {
        query += " AND GioiTinh = ?";
        params.push(gioiTinh);
      }

      // 4. Tìm theo địa chỉ (tương đối)
      if (diaChi) {
        query += " AND DiaChi LIKE ?";
        params.push(`%${diaChi}%`);
      }

      // 5. Tìm theo chức vụ
      if (chucVu) {
        query += " AND ChucVu = ?";
        params.push(chucVu);
      }

      const [rows] = await db.query(query, params);
      return rows;
    } catch (err) {
      logger.error("Repository Error: searchAdvanced NhanVien failed", err);
      throw err;
    }
  },

  // Hàm lấy dữ liệu phân trang
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching NhanVien with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;
      
      // 1. Lấy dữ liệu theo trang
      const queryData = "SELECT * FROM NhanVien LIMIT ? OFFSET ?";
      const [rows] = await db.query(queryData, [limit, offset]);
      
      // 2. Đếm tổng số lượng để tính tổng số trang
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM NhanVien");
      
      return {
        nhanViens: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated NhanVien failed", err);
      throw err;
    }
  },
  
  create: async ({ MaNV, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam }) => {
    logger.info(`Repository: Creating NhanVien ${MaNV}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO NhanVien (MaNV, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [MaNV, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam]
      );
      return { MaNV, HoTen , NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam};
    } catch (err) {
      logger.error("Repository Error: create NhanVien failed", err);
      throw err;
    }
  },

  update: async (MaNV, { HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam }) => {
    logger.info(`Repository: Updating NhanVien ${MaNV}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE NhanVien SET HoTen = ?, NgaySinh = ?, GioiTinh = ?, SoDienThoai = ?, Email = ?, DiaChi = ?, ChucVu = ?, LuongCoBan = ?, NgayVaoLam = ? WHERE MaNV = ?",
        [HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam, MaNV]
      );
      return { MaNV, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam };
    } catch (err) {
      logger.error(`Repository Error: update NhanVien failed for MaNV ${MaNV}`, err);
      throw err;
    }
  },

  delete: async (MaNV) => {
    logger.info(`Repository: Deleting NhanVien ${MaNV}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM NhanVien WHERE MaNV = ?", [MaNV]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete NhanVien failed for MaNV ${MaNV}`, err);
      throw err;
    }
  },
  // THỐNG KÊ HIỆU SUẤT NHÂN VIÊN
  getPerformanceStats: async (startDate, endDate) => {
    logger.info(`Repository: Getting Employee Performance from ${startDate} to ${endDate}`);
    try {
      const db = await pool;
      
      // Logic:
      // 1. LEFT JOIN NhanVien với HoaDon để lấy cả những nhân viên chưa bán được gì (Doanh thu = 0).
      // 2. Chỉ tính các hóa đơn có TrangThai = 'HoanThanh'.
      // 3. COALESCE để chuyển giá trị NULL thành 0.
      
      const sql = `
        SELECT 
          nv.MaNV, 
          nv.HoTen, 
          nv.ChucVu,
          COUNT(hd.MaHD) as SoDonHang,
          COALESCE(SUM(hd.TongTien), 0) as TongDoanhThu
        FROM NhanVien nv
        LEFT JOIN HoaDon hd ON nv.MaNV = hd.MaNV 
          AND hd.TrangThai = 'HoanThanh'
          AND hd.NgayLap >= ? 
          AND hd.NgayLap <= ?
        GROUP BY nv.MaNV, nv.HoTen, nv.ChucVu
        ORDER BY TongDoanhThu DESC
      `;


      const [rows] = await db.query(sql, [startDate, endDate]);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getPerformanceStats failed", err);
      throw err;
    }
  },

  //xuat excel
  getAllForExport: async () => {
    const db = await pool;
    // Lấy tất cả nhân viên
    const [rows] = await db.query("SELECT * FROM NhanVien ORDER BY MaNV ASC");
    return rows;
  }
};