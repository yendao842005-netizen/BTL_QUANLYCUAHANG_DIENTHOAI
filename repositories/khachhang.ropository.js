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