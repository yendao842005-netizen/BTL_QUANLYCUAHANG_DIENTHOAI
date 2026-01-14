import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

// Hàm hỗ trợ sinh mã tự động (VD: HD009 -> HD010)
const generateNextId = async (connection) => {
  const query = `SELECT MaHD FROM HoaDon ORDER BY LENGTH(MaHD) DESC, MaHD DESC LIMIT 1`;
  const [rows] = await connection.query(query);
  let nextId = 1;
  if (rows.length > 0) {
    // Lấy phần số từ mã cuối cùng (VD: HD100 -> 100)
    const lastNumber = parseInt(rows[0].MaHD.replace(/\D/g, '')); 
    if (!isNaN(lastNumber)) nextId = lastNumber + 1;
  }
  // Format thành HD + 3 chữ số (VD: HD001, HD010)
  return 'HD' + String(nextId).padStart(3, '0');
};

export const HoaDonRepository = {
  // --- HÀM MỚI: Sinh mã hóa đơn ---
  generateId: async () => {
    const db = await pool;
    return await generateNextId(db);
  },

  getAll: async () => {
    logger.info("Repository: Fetching all HoaDon");
    try {
      const db = await pool;
      const query = `SELECT * from HoaDon ORDER BY NgayLap DESC`;
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

  // --- SỬA HÀM CREATE: Đảm bảo nhận đủ dữ liệu ---
  create: async (data) => {
    logger.info(`Repository: Creating HoaDon ${data.MaHD}`);
    try {
      const db = await pool;
      const query = `
        INSERT INTO HoaDon 
        (MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, PhuongThucThanhToan, GhiChu) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        data.MaHD, 
        data.MaKH, 
        data.MaNV || null, // Nếu khách mua online thì MaNV là null
        data.NgayLap, 
        data.TongTien, 
        data.TrangThai, 
        data.PhuongThucThanhToan, 
        data.GhiChu
      ];

      await db.query(query, values);
      return data;
    } catch (err) {
      logger.error("Repository Error: create HoaDon failed", err);
      throw err;
    }
  },

  // Phân trang & Tìm kiếm
  getPaginated: async (offset, limit, search, trangThai, phuongThuc) => {
    try {
      const db = await pool;
      
      // 1. Khởi tạo câu query cơ bản với WHERE 1=1 (để dễ nối chuỗi AND)
      let whereClause = "WHERE 1=1";
      const params = [];

      // 2. Xử lý Tìm kiếm (theo Mã HĐ hoặc Tên KH)
      if (search) {
        whereClause += " AND (hd.MaHD LIKE ? OR kh.HoTen LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // 3. [MỚI] Xử lý Lọc Trạng thái
      if (trangThai) {
        whereClause += " AND hd.TrangThai = ?";
        params.push(trangThai);
      }

      // 4. [MỚI] Xử lý Lọc Phương thức thanh toán
      if (phuongThuc) {
        // Ánh xạ giá trị từ frontend sang giá trị trong DB (nếu cần)
        // Ví dụ: Frontend gửi 'banking' -> DB lưu 'ChuyenKhoan'
        // Nhưng nếu frontend đã gửi đúng value (TienMat, ChuyenKhoan...) thì dùng trực tiếp:
        whereClause += " AND hd.PhuongThucThanhToan = ?";
        params.push(phuongThuc);
      }

      // 5. Query lấy dữ liệu
      const query = `
        SELECT hd.*, kh.HoTen as TenKhachHang 
        FROM HoaDon hd 
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        ${whereClause}
        ORDER BY hd.NgayLap DESC 
        LIMIT ? OFFSET ?
      `;

      // Tạo params cho query dữ liệu (thêm limit, offset vào cuối)
      const dataParams = [...params, parseInt(limit), parseInt(offset)];
      const [rows] = await db.query(query, dataParams);

      // 6. Query đếm tổng số bản ghi (để phân trang)
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM HoaDon hd 
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        ${whereClause}
      `;
      // Dùng params gốc (không có limit/offset)
      const [count] = await db.query(countQuery, params);
      
      return { data: rows, total: count[0].total };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },
  // ... (Giữ nguyên các hàm thống kê khác: getOrderCounts, filterByDate, getMonthlyRevenueByYear...)
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
      return rows[0];
    } catch (err) { throw err; }
  }, 

  filterByDate: async (startDate, endDate) => {
    try {
      const db = await pool; 
      const query = "SELECT * FROM HoaDon WHERE NgayLap BETWEEN ? AND ?";
      const [rows] = await db.query(query, [startDate, endDate]);
      return rows;
    } catch (err) { throw err; }
  },

  getMonthlyRevenueByYear: async (year) => {
    try {
      const db = await pool; 
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

  update: async (MaHD, { TongTien, TrangThai, GhiChu, PhuongThucThanhToan }) => {
    logger.info(`Repository: Updating HoaDon ${MaHD}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE HoaDon SET TongTien = COALESCE(?, TongTien), TrangThai = ?, GhiChu = ?, PhuongThucThanhToan = COALESCE(?, PhuongThucThanhToan) WHERE MaHD = ?",
        [TongTien, TrangThai, GhiChu, PhuongThucThanhToan, MaHD]
      );
      return { MaHD, TongTien, TrangThai, GhiChu, PhuongThucThanhToan };
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