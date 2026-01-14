import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

export const DashboardRepository = {
  // 1. Thống kê DOANH THU (Tháng này vs Tháng trước)
  getRevenueStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          COALESCE(SUM(CASE 
            WHEN MONTH(NgayLap) = MONTH(CURRENT_DATE()) AND YEAR(NgayLap) = YEAR(CURRENT_DATE())
            THEN TongTien ELSE 0 END), 0) as DoanhThuThangNay,
          COALESCE(SUM(CASE 
            WHEN NgayLap >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(),'%Y-%m-01'), INTERVAL 1 MONTH)
             AND NgayLap < DATE_FORMAT(CURRENT_DATE(),'%Y-%m-01')
            THEN TongTien ELSE 0 END), 0) as DoanhThuThangTruoc
        FROM HoaDon
        WHERE TrangThai = 'HoanThanh'
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) { throw err; }
  },

  // 2. Thống kê KHÁCH HÀNG
  getCustomerStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          (SELECT COUNT(DISTINCT MaKH) FROM HoaDon 
           WHERE MONTH(NgayLap) = MONTH(CURRENT_DATE()) AND YEAR(NgayLap) = YEAR(CURRENT_DATE())) as KhachMuaThangNay,
          (SELECT COUNT(DISTINCT MaKH) FROM HoaDon 
           WHERE NgayLap >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(),'%Y-%m-01'), INTERVAL 1 MONTH)
             AND NgayLap < DATE_FORMAT(CURRENT_DATE(),'%Y-%m-01')) as KhachMuaThangTruoc,
          (SELECT COUNT(*) FROM KhachHang) as TongKhachHang
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) { throw err; }
  },

  // 3. Thống kê ĐƠN HÀNG
  getOrderStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          COUNT(CASE WHEN MONTH(NgayLap) = MONTH(CURRENT_DATE()) AND YEAR(NgayLap) = YEAR(CURRENT_DATE()) THEN 1 END) as DonThangNay,
          COUNT(CASE WHEN NgayLap >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(),'%Y-%m-01'), INTERVAL 1 MONTH)
             AND NgayLap < DATE_FORMAT(CURRENT_DATE(),'%Y-%m-01') THEN 1 END) as DonThangTruoc,
          COUNT(CASE WHEN TrangThai = 'ChoXuLy' THEN 1 END) as DonChoXuLy
        FROM HoaDon
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) { throw err; }
  },

  // 4. Thống kê SẢN PHẨM & TỒN KHO
  getProductStats: async () => {
    try {
      const db = await pool;
      const sql = `
        SELECT 
          COALESCE(SUM(SoLuongTon), 0) as TongTonKho,
          COUNT(CASE WHEN SoLuongTon <= 10 AND SoLuongTon > 0 THEN 1 END) as SapHetHang
        FROM SanPham
      `;
      const [rows] = await db.query(sql);
      return rows[0];
    } catch (err) { throw err; }
  },

  // 5. BIỂU ĐỒ DOANH THU 12 THÁNG
  getMonthlyRevenue: async (year) => {
    const db = await pool;
    const sql = `
      SELECT MONTH(NgayLap) as Thang, SUM(TongTien) as DoanhThu 
      FROM HoaDon 
      WHERE YEAR(NgayLap) = ? AND TrangThai = 'HoanThanh'
      GROUP BY MONTH(NgayLap) ORDER BY Thang ASC
    `;
    const [rows] = await db.query(sql, [year]);
    return rows;
  },

  // 6. TOP SẢN PHẨM BÁN CHẠY
  getTopSellingProducts: async () => {
    const db = await pool;
    // [FIX] Sửa MaDM -> MaDanhMuc nếu có join
    const sql = `
      SELECT sp.TenSanPham, COALESCE(SUM(ct.SoLuong), 0) as SoLuongBan
      FROM ChiTietHoaDon ct
      JOIN HoaDon hd ON ct.MaHD = hd.MaHD
      JOIN SanPham sp ON ct.MaSP = sp.MaSP
      WHERE hd.TrangThai = 'HoanThanh' 
      GROUP BY sp.MaSP, sp.TenSanPham
      ORDER BY SoLuongBan DESC LIMIT 5
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // 7. BIỂU ĐỒ TỶ LỆ DANH MỤC (SỬA LỖI 500 TẠI ĐÂY)
  getCategorySalesStats: async () => {
    const db = await pool;
    const sql = `
      SELECT dm.TenDanhMuc, COALESCE(SUM(ct.SoLuong), 0) as TongSoLuong
      FROM DanhMuc dm
      -- SỬA Ở ĐÂY: Đổi dm.MaDanhMuc thành dm.MaDM
      -- Kiểm tra cả sp.MaDanhMuc, nếu bảng SanPham dùng MaDM thì cũng đổi luôn thành sp.MaDM
      LEFT JOIN SanPham sp ON dm.MaDM = sp.MaDM 
      LEFT JOIN ChiTietHoaDon ct ON sp.MaSP = ct.MaSP
      LEFT JOIN HoaDon hd ON ct.MaHD = hd.MaHD AND hd.TrangThai = 'HoanThanh'
      -- SỬA CẢ Ở GROUP BY
      GROUP BY dm.MaDM, dm.TenDanhMuc
      HAVING TongSoLuong > 0
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // 8. ĐƠN HÀNG GẦN ĐÂY
  getRecentOrders1: async () => {
    const db = await pool;
    const sql = `
      SELECT hd.MaHD, COALESCE(kh.HoTen, 'Khách vãng lai') as TenKhachHang, 
             hd.NgayLap, hd.TongTien, hd.TrangThai 
      FROM HoaDon hd
      LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
      ORDER BY hd.NgayLap DESC LIMIT 5
    `;
    const [rows] = await db.query(sql);
    return rows;
  },
  
  // Các hàm cũ (giữ lại để tránh lỗi import)
  getCardStats: async () => { return {}; },
  getRevenueLast7Days: async () => { return []; },
  getRecentOrders: async () => { return []; }
};