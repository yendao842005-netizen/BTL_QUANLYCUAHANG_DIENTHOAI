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
// --- CẬP NHẬT HÀM TÌM KIẾM NÂNG CAO (Có phân trang + Tính tổng chi tiêu) ---
  searchAdvanced: async ({ hoTen, soDienThoai, diaChi, email,GioiTinh, limit, offset }) => {
    logger.info("Repository: Advanced searching KhachHang with Pagination");
    try {
      const db = await pool;
      
      // 1. Xây dựng mệnh đề WHERE động
      let whereClause = "WHERE 1=1";
      const params = [];

      if (hoTen) {
        whereClause += " AND kh.HoTen LIKE ?";
        params.push(`%${hoTen}%`);
      }
      if (soDienThoai) {
        whereClause += " AND kh.SoDienThoai LIKE ?";
        params.push(`%${soDienThoai}%`);
      }
      if (diaChi) {
        whereClause += " AND kh.DiaChi LIKE ?";
        params.push(`%${diaChi}%`);
      }
      if (email) {
        whereClause += " AND kh.Email LIKE ?";
        params.push(`%${email}%`);
      }
      if (GioiTinh) {
        whereClause += " AND kh.GioiTinh = ?";
        params.push(GioiTinh);
      }

      // 2. Query lấy dữ liệu (Kèm JOIN để tính VIP)
      // Lưu ý: GROUP BY phải bao gồm các trường trong WHERE hoặc PK
      const sqlData = `
        SELECT 
            kh.*, 
            COUNT(hd.MaHD) as TongDon, 
            COALESCE(SUM(hd.TongTien), 0) as TongChiTieu
        FROM KhachHang kh
        LEFT JOIN HoaDon hd ON kh.MaKH = hd.MaKH
        ${whereClause}
        GROUP BY kh.MaKH
        ORDER BY kh.MaKH ASC
        LIMIT ? OFFSET ?
      `;

      // Tạo mảng params mới cho câu Data (thêm limit, offset vào cuối)
      const dataParams = [...params, limit, offset];
      const [rows] = await db.query(sqlData, dataParams);

      // 3. Query đếm tổng số kết quả tìm thấy (để tính số trang)
      const sqlCount = `SELECT COUNT(*) as total FROM KhachHang kh ${whereClause}`;
      const [countRows] = await db.query(sqlCount, params);

      return {
        khachHangs: rows,
        totalItems: countRows[0].total
      };
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
      
      // Query dữ liệu kèm tính toán
      const queryData = `
        SELECT 
            kh.*, 
            COUNT(hd.MaHD) as TongDon, 
            COALESCE(SUM(hd.TongTien), 0) as TongChiTieu
        FROM KhachHang kh
        LEFT JOIN HoaDon hd ON kh.MaKH = hd.MaKH
        GROUP BY kh.MaKH
        ORDER BY kh.MaKH ASC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await db.query(queryData, [limit, offset]);
      
      // Query đếm tổng số bản ghi
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
    
  create: async ({ MaKH, HoTen, SoDienThoai, DiaChi, Email ,NgaySinh,GioiTinh}) => {
    logger.info(`Repository: Creating KhachHang ${MaKH}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO KhachHang (MaKH, HoTen, SoDienThoai, DiaChi, Email, NgaySinh, GioiTinh) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [MaKH, HoTen, SoDienThoai, DiaChi, Email,NgaySinh,GioiTinh]
      );
      return { MaKH, HoTen };
    } catch (err) {
      logger.error("Repository Error: create KhachHang failed", err);
      throw err;
    }
  },

  update: async (MaKH, { HoTen, SoDienThoai, DiaChi, Email,NgaySinh,GioiTinh }) => {
    logger.info(`Repository: Updating KhachHang ${MaKH}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE KhachHang SET HoTen = ?, SoDienThoai = ?, DiaChi = ?, Email = ? , NgaySinh = ?, GioiTinh = ? WHERE MaKH = ?",
        [HoTen, SoDienThoai, DiaChi, Email,NgaySinh,GioiTinh , MaKH]
      );
      return { MaKH, HoTen, SoDienThoai, DiaChi, Email ,NgaySinh,GioiTinh};
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


  // 2.  Lấy danh sách khách hàng kèm tổng tiền họ đã chi tiêu (Xếp hạng VIP)
  getTopSpenders: async (limit = 10) => {
    const db = await pool;
    // Query này nối bảng KhachHang với HoaDon, tính tổng tiền các đơn hàng 'HoanThanh'
    const sql = `
      SELECT 
        kh.MaKH, 
        kh.HoTen, 
        kh.SoDienThoai, 
        COUNT(hd.MaHD) as SoLanMua,
        COALESCE(SUM(hd.TongTien), 0) as TongChiTieu
      FROM KhachHang kh
      LEFT JOIN HoaDon hd ON kh.MaKH = hd.MaKH AND hd.TrangThai = 'HoanThanh'
      GROUP BY kh.MaKH, kh.HoTen, kh.SoDienThoai
      ORDER BY TongChiTieu DESC
      LIMIT ?
    `;
    const [rows] = await db.query(sql, [limit]);
    return rows;
  },

  // 3.Lịch sử mua hàng chi tiết của 1 khách (Kèm tên SP đã mua)
  getOrdersAndDetails: async (MaKH) => {
    const db = await pool;
    // Query phức tạp: Join 4 bảng (Khach -> HoaDon -> ChiTiet -> SanPham)
    const sql = `
      SELECT 
          kh.HoTen,
          kh.SoDienThoai,
          kh.Email,
          kh.DiaChi,
          kh.GioiTinh,
          kh.NgaySinh,
          hd.MaHD,
          hd.NgayLap,
          hd.TongTien,
          hd.TrangThai,
          hd.GhiChu,
          sp.MaSP,
          sp.TenSanPham,
          ct.SoLuong,
          ct.DonGia,
          ct.ThanhTien
        FROM HoaDon hd
        JOIN ChiTietHoaDon ct ON hd.MaHD = ct.MaHD
        JOIN SanPham sp ON ct.MaSP = sp.MaSP
        JOIN KhachHang kh ON hd.MaKH = kh.MaKH  -- Join bảng KhachHang
        WHERE hd.MaKH = ?
        ORDER BY hd.NgayLap DESC
    `;
    const [rows] = await db.query(sql, [MaKH]);
    return rows;
  },
  //xuat excel toàn bộ khách hàng
  getAllForExport: async () => {
    const db = await pool;
    const [rows] = await db.query("SELECT * FROM KhachHang ORDER BY MaKH ASC");
    return rows;
  },



  // Lấy toàn bộ chi tiết lịch sử mua hàng của 1 khách để xuất Excel
  getExportDataByCustomer: async (MaKH) => {
    logger.info(`Repository: Fetching export data for Customer ${MaKH}`);
    try {
      const db = await pool;
      const sql = `
        SELECT 
          kh.HoTen, 
          kh.SoDienThoai,
          kh.DiaChi,
          hd.MaHD, 
          hd.NgayLap, 
          hd.TrangThai,
          sp.MaSP,
          sp.TenSanPham,
          ct.SoLuong, 
          ct.DonGia, 
          ct.ThanhTien
        FROM KhachHang kh
        JOIN HoaDon hd ON kh.MaKH = hd.MaKH
        JOIN ChiTietHoaDon ct ON hd.MaHD = ct.MaHD
        JOIN SanPham sp ON ct.MaSP = sp.MaSP
        WHERE kh.MaKH = ?
        ORDER BY hd.NgayLap DESC, hd.MaHD ASC
      `;
      const [rows] = await db.query(sql, [MaKH]);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getExportDataByCustomer failed", err);
      throw err;
    }
  }
};