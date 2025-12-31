import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const DashboardRepository = {
  // 1. Lấy các chỉ số đếm cơ bản (Card Stats)
  getCardStats: async () => {
    const db = await pool;
    // Chạy song song nhiều câu lệnh SELECT COUNT/SUM cho nhanh
    
    // a. Doanh thu hôm nay
    const sqlRevenueToday = `
      SELECT COALESCE(SUM(TongTien), 0) as DoanhThuHomNay 
      FROM HoaDon 
      WHERE DATE(NgayLap) = CURRENT_DATE AND TrangThai = 'HoanThanh'
    `;

    // b. Đơn hàng đang chờ xử lý
    const sqlPendingOrders = `
      SELECT COUNT(*) as DonChoXuLy 
      FROM HoaDon 
      WHERE TrangThai = 'ChoXuLy'
    `;

    // c. Tổng số khách hàng
    const sqlTotalCustomers = `SELECT COUNT(*) as TongKhachHang FROM KhachHang`;

    // d. Sản phẩm sắp hết hàng (<= 5)
    const sqlLowStock = `SELECT COUNT(*) as SanPhamSapHet FROM SanPham WHERE SoLuongTon <= 20`;

    // Thực thi song song (Promise.all)
    const [rev] = await db.query(sqlRevenueToday);
    const [pending] = await db.query(sqlPendingOrders);
    const [cust] = await db.query(sqlTotalCustomers);
    const [stock] = await db.query(sqlLowStock);

    return {
      revenueToday: rev[0].DoanhThuHomNay,
      pendingOrders: pending[0].DonChoXuLy,
      totalCustomers: cust[0].TongKhachHang,
      lowStockCount: stock[0].SanPhamSapHet
    };
  },

  // 2. Lấy doanh thu 7 ngày gần nhất (Để vẽ biểu đồ)
  getRevenueLast7Days: async () => {
    const db = await pool;
    const sql = `
      SELECT 
        DATE(NgayLap) as Ngay, 
        SUM(TongTien) as DoanhThu 
      FROM HoaDon 
      WHERE NgayLap >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY) 
        AND TrangThai = 'HoanThanh'
      GROUP BY DATE(NgayLap)
      ORDER BY Ngay ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // 3. Lấy 5 đơn hàng mới nhất (Để hiện bảng xem nhanh)
  getRecentOrders: async () => {
    const db = await pool;
    const sql = `
      SELECT hd.MaHD, kh.HoTen, hd.NgayLap, hd.TongTien, hd.TrangThai
      FROM HoaDon hd
      LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
      ORDER BY hd.NgayLap DESC
      LIMIT 5
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // 1. Thống kê DOANH THU (Tháng này vs Tháng trước)
  getRevenueStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          -- Doanh thu tháng này
          COALESCE(SUM(CASE 
            WHEN MONTH(NgayLap) = MONTH(CURRENT_DATE()) AND YEAR(NgayLap) = YEAR(CURRENT_DATE()) 
            THEN TongTien ELSE 0 END), 0) as DoanhThuThangNay,
          -- Doanh thu tháng trước
          COALESCE(SUM(CASE 
            WHEN MONTH(NgayLap) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
                 AND YEAR(NgayLap) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
            THEN TongTien ELSE 0 END), 0) as DoanhThuThangTruoc
        FROM HoaDon
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // 2. Thống kê KHÁCH HÀNG (ĐÃ SỬA: Lấy từ HoaDon để không bị lỗi thiếu cột NgayLap)
  getCustomerStats: async () => {
    try {
      const db = await pool;
      // Dùng subquery để lấy số liệu từ 2 bảng khác nhau
      const sql = `
        SELECT 
          -- Đếm khách hàng mua đơn tháng này (Dựa vào HoaDon)
          (SELECT COUNT(DISTINCT MaKH) 
           FROM HoaDon 
           WHERE MONTH(NgayLap) = MONTH(CURRENT_DATE()) 
             AND YEAR(NgayLap) = YEAR(CURRENT_DATE())) as KhachMuaThangNay,
             
          -- Đếm khách hàng mua đơn tháng trước (Dựa vào HoaDon)
          (SELECT COUNT(DISTINCT MaKH) 
           FROM HoaDon 
           WHERE MONTH(NgayLap) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
             AND YEAR(NgayLap) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))) as KhachMuaThangTruoc,

          -- Tổng số lượng khách hàng trong hệ thống (Dựa vào KhachHang)
          (SELECT COUNT(*) FROM KhachHang) as TongKhachHang
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // 3. Thống kê ĐƠN HÀNG
  getOrderStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          -- Đơn tháng này
          COUNT(CASE WHEN MONTH(NgayLap) = MONTH(CURRENT_DATE()) AND YEAR(NgayLap) = YEAR(CURRENT_DATE()) THEN 1 END) as DonThangNay,
          -- Đơn tháng trước
          COUNT(CASE WHEN MONTH(NgayLap) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) AND YEAR(NgayLap) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) THEN 1 END) as DonThangTruoc,
          -- Đơn chờ xử lý
          COUNT(CASE WHEN TrangThai = 'ChoXuLy' THEN 1 END) as DonChoXuLy
        FROM HoaDon
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // 4. Thống kê SẢN PHẨM & TỒN KHO
  getProductStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          SUM(SoLuongTon) as TongTonKho,
          COUNT(CASE WHEN SoLuongTon <= 20 AND SoLuongTon > 0 THEN 1 END) as SapHetHang
        FROM SanPham
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) {
      throw err;
    }
  },



  // 1. BIỂU ĐỒ DOANH THU 12 THÁNG (Của năm hiện tại)
  getMonthlyRevenue: async (year) => {
    const db = await pool;
    const sql = `
      SELECT 
        MONTH(NgayLap) as Thang, 
        SUM(TongTien) as DoanhThu 
      FROM HoaDon 
      WHERE YEAR(NgayLap) = ? AND TrangThai = 'HoanThanh'
      GROUP BY MONTH(NgayLap)
      ORDER BY Thang ASC
    `;
    const [rows] = await db.query(sql, [year]);
    return rows;
  },

  // 2. BIỂU ĐỒ TOP 5 SẢN PHẨM BÁN CHẠY
  getTopSellingProducts: async () => {
    const db = await pool;
    const sql = `
      SELECT 
        sp.TenSanPham, 
        SUM(ct.SoLuong) as SoLuongBan
      FROM ChiTietHoaDon ct
      JOIN HoaDon hd ON ct.MaHD = hd.MaHD
      JOIN SanPham sp ON ct.MaSP = sp.MaSP
      WHERE hd.TrangThai = 'HoanThanh'
      GROUP BY sp.MaSP, sp.TenSanPham
      ORDER BY SoLuongBan DESC
      LIMIT 5
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // 3. BIỂU ĐỒ TỶ LỆ DANH MỤC (Dựa trên số lượng sản phẩm đã bán)
  getCategorySalesStats: async () => {
    const db = await pool;
    const sql = `
      SELECT 
        dm.TenDanhMuc, 
        SUM(ct.SoLuong) as TongSoLuong
      FROM ChiTietHoaDon ct
      JOIN HoaDon hd ON ct.MaHD = hd.MaHD
      JOIN SanPham sp ON ct.MaSP = sp.MaSP
      JOIN DanhMuc dm ON sp.MaDM = dm.MaDM
      WHERE hd.TrangThai = 'HoanThanh'
      GROUP BY dm.MaDM, dm.TenDanhMuc
    `;
    const [rows] = await db.query(sql);
    return rows;
  },
  // 4. LẤY 4 ĐƠN HÀNG GẦN ĐÂY NHẤT
  getRecentOrders1: async () => {
    const db = await pool;
    // JOIN với bảng KhachHang để lấy tên khách
    const sql = `
      SELECT 
        hd.MaHD, 
        kh.HoTen as TenKhachHang, 
        hd.NgayLap, 
        hd.TongTien, 
        hd.TrangThai 
      FROM HoaDon hd
      LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
      ORDER BY hd.NgayLap DESC 
      LIMIT 4
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

};