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
 // 1. Phân trang & Tìm kiếm (ĐÃ SỬA)
 getPaginated: async (offset, limit, search, status, payment) => {
    try {
      const db = await pool;

      let query = `
        SELECT 
            hd.*, 
            kh.HoTen as TenKhachHang, 
            nv.HoTen as TenNhanVien 
        FROM HoaDon hd 
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV 
        WHERE 1=1
      `;
      
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM HoaDon hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
        WHERE 1=1
      `;

      const params = [];
      const countParams = [];

      // 1. Tìm kiếm (Mã HD hoặc Tên KH)
      if (search) {
        const searchClause = ` AND (hd.MaHD LIKE ? OR kh.HoTen LIKE ?)`;
        query += searchClause;
        countQuery += searchClause;
        const term = `%${search}%`;
        params.push(term, term);
        countParams.push(term, term);
      }

      // 2. Lọc theo Trạng thái (Nếu có chọn)
      if (status) {
        const statusClause = ` AND hd.TrangThai = ?`;
        query += statusClause;
        countQuery += statusClause;
        params.push(status);
        countParams.push(status);
      }

      // 3. Lọc theo Thanh toán (Nếu có chọn)
      if (payment) {
        const paymentClause = ` AND hd.PhuongThucThanhToan = ?`;
        query += paymentClause;
        countQuery += paymentClause;
        params.push(payment);
        countParams.push(payment);
      }

      // Sắp xếp và Phân trang
      query += " ORDER BY hd.NgayLap DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await db.query(query, params);
      const [count] = await db.query(countQuery, countParams);
      
      return { data: rows, total: count[0].total };
    } catch (err) { throw err; }
  },

  
  // ---  Đếm số lượng đơn hàng theo trạng thái ---
  getOrderCounts: async () => {
    try {
      const db = await pool;
      const query = `
        SELECT 
          COUNT(*) as TongDon,
          SUM(CASE WHEN TrangThai = 'ChoXuLy' THEN 1 ELSE 0 END) as ChoXuLy,
          SUM(CASE WHEN TrangThai = 'DaHuy' THEN 1 ELSE 0 END) as DaHuy,
          SUM(CASE WHEN TrangThai = 'HoanThanh' THEN 1 ELSE 0 END) as HoanThanh
        FROM HoaDon
      `;
      const [rows] = await db.query(query);
      return rows[0]; // Trả về object { TongDon, ChoXuLy, DaHuy, HoanThanh }
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
  getMonthlyRevenueByYear: async (year) => {
    try {
      const db = await pool; //
      const query = `
        SELECT 
        m.Thang,
        IFNULL(SUM(hd.TongTien), 0) AS DoanhThu
      FROM (
        SELECT 1 AS Thang UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL
        SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL
        SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL
        SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
      ) m
      LEFT JOIN HoaDon hd 
        ON MONTH(hd.NgayLap) = m.Thang
        AND YEAR(hd.NgayLap) = ?
        AND hd.TrangThai = 'HoanThanh'
      GROUP BY m.Thang
      ORDER BY m.Thang
      `;
      const [rows] = await db.query(query, [year]);
      return rows;
    } catch (err) { throw err; }
  },
  // Doanh thu theo tháng và năm
  getRevenueByMonthYear: async (month, year) => {
    try {
      const db = await pool;
      const query = `
      SELECT 
        ? AS Thang,
        ? AS Nam,
        IFNULL(SUM(TongTien), 0) AS DoanhThu
      FROM HoaDon
      WHERE 
        MONTH(NgayLap) = ?
        AND YEAR(NgayLap) = ?
        AND TrangThai = 'HoanThanh'
    `;
      const [rows] = await db.query(query, [month, year, month, year]);
      return rows[0];
    } catch (err) {
      throw err;
    }
  },


  // Lấy Top 5 sản phẩm bán chạy nhất tháng này
  getTopSellingProducts: async (month, year) => {
    const db = await pool;
    const sql = `
      SELECT 
        sp.MaSP, 
        sp.TenSanPham, 
        SUM(ct.SoLuong) as TongSoLuongDaBan,
        SUM(ct.ThanhTien) as TongDoanhThu
      FROM ChiTietHoaDon ct
      JOIN HoaDon hd ON ct.MaHD = hd.MaHD
      JOIN SanPham sp ON ct.MaSP = sp.MaSP
      WHERE MONTH(hd.NgayLap) = ? 
        AND YEAR(hd.NgayLap) = ? 
        AND hd.TrangThai = 'HoanThanh'
      GROUP BY sp.MaSP, sp.TenSanPham
      ORDER BY TongSoLuongDaBan DESC
      LIMIT 5
    `;
    const [rows] = await db.query(sql, [month, year]);
    return rows;
  },

  create: async ({ MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu, PhuongThucThanhToan }) => {
    logger.info(`Repository: Creating HoaDon ${MaHD}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO HoaDon (MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu,PhuongThucThanhToan) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
        [MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu, PhuongThucThanhToan]
      );
      return { MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu, PhuongThucThanhToan };
    } catch (err) {
      logger.error("Repository Error: create HoaDon failed", err);
      throw err;
    }
  },

  update: async (MaHD, {  TrangThai, GhiChu }) => {
    logger.info(`Repository: Updating HoaDon ${MaHD}`);
    try {
      const db = await pool;
      // Hóa đơn thường chỉ update trạng thái, tổng tiền hoặc ghi chú
      await db.query(
        "UPDATE HoaDon SET  TrangThai = ?, GhiChu = ? WHERE MaHD = ?",
        [TrangThai, GhiChu, MaHD]
      );
      return { MaHD,  TrangThai, GhiChu };
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