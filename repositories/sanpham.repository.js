import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";


export const SanPhamRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all SanPhams");
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM SanPham");
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  getByMa: async (MaSP) => {
    logger.info(`Repository: Fetching SanPham with Ma ${MaSP}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM SanPham WHERE MaSP = ?", [MaSP]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for Ma ${MaSP}`, err);
      throw err;
    }
  },
  // 1. Hàm lấy danh sách phân trang (Có sắp xếp, mặc định theo MaSP)
  getPaginated: async (offset, limit, sortBy = 'MaSP', order = 'ASC') => {
    logger.info(`Repository: Fetching paginated SanPham sorted by ${sortBy} ${order}`);
    try {
      const db = await pool;
      
      // Danh sách các cột được phép sắp xếp để bảo mật SQL
      const allowedFields = ['MaSP', 'GiaBan', 'SoLuongTon', 'NgayNhap'];
      const finalSort = allowedFields.includes(sortBy) ? sortBy : 'MaSP';
      const finalOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const query = `SELECT * FROM SanPham ORDER BY ${finalSort} ${finalOrder} LIMIT ? OFFSET ?`;
      const [rows] = await db.query(query, [limit, offset]);
      
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM SanPham");
      
      return { products: rows, totalItems: countRows[0].total };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },
  // Hàm tìm kiếm nâng cao theo yêu cầu cụ thể
  searchAdvanced: async ({ ten, giaMin, giaMax, tonKhoMin, offset, limit ,sort}) => {
    logger.info("Repository: Advanced searching SanPham with specific criteria");
    try {
      const db = await pool;
      
      // 1. Xây dựng điều kiện lọc (WHERE clause) chung cho cả 2 câu lệnh
      let whereClause = "WHERE 1=1";
      const params = [];

      // Lọc theo tên
      if (ten) {
        whereClause += " AND TenSanPham LIKE ?";
        params.push(`%${ten}%`);
      }

      // Lọc theo giá
      if (giaMin !== undefined && giaMin !== null) {
        whereClause += " AND GiaBan >= ?";
        params.push(giaMin);
      }
      if (giaMax !== undefined && giaMax !== null) {
        whereClause += " AND GiaBan <= ?";
        params.push(giaMax);
      }

      // Lọc tồn kho
      if (tonKhoMin !== undefined && tonKhoMin !== null) {
        whereClause += " AND SoLuongTon > ?";
        params.push(tonKhoMin);
      }
      let orderByClause = "ORDER BY MaSP ASC";
      switch (sort) {
          case 'price_asc':
              orderByClause = "ORDER BY GiaBan ASC";
              break;
          case 'price_desc':
              orderByClause = "ORDER BY GiaBan DESC";
              break;

      }
      // 2. Câu lệnh lấy dữ liệu (Có phân trang)
      // Lưu ý: params lúc này chưa có limit/offset, cần copy ra mảng mới để thêm vào
      const sqlData = `SELECT * FROM SanPham ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`;
      const [rows] = await db.query(sqlData, [...params, limit, offset]);

      // 3. Câu lệnh đếm tổng số kết quả TÌM THẤY (Để tính số trang)
      // QUAN TRỌNG: Phải dùng đúng whereClause và params của việc lọc
      const sqlCount = `SELECT COUNT(*) as total FROM SanPham ${whereClause}`;
      const [countRows] = await db.query(sqlCount, params);
      
      return {
        products: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: searchAdvanced failed", err);
      throw err;
    }
  },


  
  create: async ({ MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa,HinhAnh}) => {
    logger.info(`Repository: Creating SanPham ${MaSP}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO SanPham ( MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa ,HinhAnh) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)",
        [ MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa,HinhAnh ]
      );
      return {  MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa,HinhAnh  };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (MaSP, {TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa,HinhAnh}) => {
    logger.info(`Repository: Updating SanPham ${MaSP}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE SanPham SET TenSanPham = ?, MaDM = ?, MaNCC = ?, GiaBan = ?, SoLuongTon = ?, NgayNhap = ?, MoTa = ? ,HinhAnh = ?WHERE MaSP = ?",
        [TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa, HinhAnh, MaSP]
      );
      return { MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa,HinhAnh };
    } catch (err) {
      logger.error(`Repository Error: update failed for Ma ${MaSP}`, err);
      throw err;
    }
  },

  delete: async (MaSP) => {
    logger.info(`Repository: Deleting SanPham ${MaSP}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM SanPham WHERE MaSP = ?", [MaSP]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaSP ${MaSP}`, err);
      throw err;
    }
  },

  // THỐNG KÊ KHO: Sắp hết hàng & Tồn kho lâu
  getInventoryStats: async (threshold = 10) => {
    logger.info(`Repository: Getting Inventory Stats (Threshold: ${threshold})`);
    try {
      const db = await pool;
      
      // 1. Query lấy sản phẩm Sắp hết hàng (Low Stock)
      // Điều kiện: Tồn kho <= ngưỡng và Tồn kho > 0 (nếu = 0 là hết hàng hẳn)
      const sqlLowStock = `
        SELECT * FROM SanPham 
        WHERE SoLuongTon <= ? AND SoLuongTon > 0
        ORDER BY SoLuongTon ASC
      `;

      // 2. Query lấy sản phẩm Tồn kho lâu (Dead Stock) - Ví dụ: Nhập hơn 90 ngày chưa bán hết
      // Logic: Còn hàng (SoLuongTon > 0) VÀ Ngày nhập cách đây quá 90 ngày
      const sqlOldStock = `
        SELECT *, DATEDIFF(CURRENT_DATE, NgayNhap) as SoNgayTon
        FROM SanPham 
        WHERE SoLuongTon > 0 
          AND NgayNhap <= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
        ORDER BY NgayNhap ASC
      `;

      // Chạy song song 2 câu lệnh cho nhanh
      const [lowStockRows] = await db.query(sqlLowStock, [threshold]);
      const [oldStockRows] = await db.query(sqlOldStock);

      return {
        lowStock: lowStockRows,
        oldStock: oldStockRows
      };
    } catch (err) {
      logger.error("Repository Error: getInventoryStats failed", err);
      throw err;
    }
  },

  // hàm xuất excel
  // Hàm lấy dữ liệu đầy đủ (JOIN bảng) để xuất Excel đẹp hơn
  getAllForExport: async () => {
    logger.info("Repository: Fetching all products for Excel export");
    try {
      const db = await pool;
      // Join với DanhMuc và NhaCungCap để lấy tên thay vì chỉ lấy Mã
      const sql = `
        SELECT 
          sp.MaSP,
          sp.TenSanPham,
          dm.TenDanhMuc,
          ncc.TenNhaCungCap,
          sp.GiaBan,
          sp.SoLuongTon,
          sp.NgayNhap,
          sp.MoTa
        FROM SanPham sp
        LEFT JOIN DanhMuc dm ON sp.MaDM = dm.MaDM
        LEFT JOIN NhaCungCap ncc ON sp.MaNCC = ncc.MaNCC
        ORDER BY sp.MaSP ASC
      `;
      const [rows] = await db.query(sql);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAllForExport failed", err);
      throw err;
    }
  },

  // Hàm thống kê tồn kho theo danh mục
  getCategoryStats: async () => {
    logger.info("Repository: Getting Inventory Stats by Category");
    try {
      const db = await pool;
      // Query tính tổng số lượng sản phẩm, tổng tồn kho và tổng giá trị
      // Lưu ý: Cột "Đã bán" cần JOIN với bảng HoaDon, ở đây mình tạm để 0 (hoặc bạn có thể bổ sung sau)
      const sql = `
        SELECT 
          sp.MaDM,
          dm.TenDanhMuc,
          COUNT(sp.MaSP) as SoLuongSP,
          COALESCE(SUM(sp.SoLuongTon), 0) as TongTonKho,
          COALESCE(SUM(sp.SoLuongTon * sp.GiaBan), 0) as GiaTriTonKho,
          (
            SELECT COALESCE(SUM(ct.SoLuong), 0)
            FROM ChiTietHoaDon ct
            JOIN HoaDon hd ON ct.MaHD = hd.MaHD
            JOIN SanPham sub_sp ON ct.MaSP = sub_sp.MaSP
            WHERE sub_sp.MaDM = sp.MaDM 
              AND MONTH(hd.NgayLap) = MONTH(CURRENT_DATE()) 
              AND YEAR(hd.NgayLap) = YEAR(CURRENT_DATE())
          ) as DaBanThangNay
        FROM SanPham sp
        LEFT JOIN DanhMuc dm ON sp.MaDM = dm.MaDM
        GROUP BY sp.MaDM, dm.TenDanhMuc
      `;
      
      const [rows] = await db.query(sql);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getCategoryStats failed", err);
      throw err;
    }
  },


  // Hàm thống kê tổng quan (cho các thẻ Stats Card)
  getGeneralStats: async () => {
    logger.info("Repository: Getting General Product Stats");
    try {
      const db = await pool;
      
      // Logic tính toán:
      // 1. TongSanPham: Đếm tất cả dòng
      // 2. TongGiaTri: Tổng (GiaBan * SoLuongTon)
      // 3. SapHetHang: Đếm sp có tồn kho <= 10 (và > 0)
      // 4. BanChay: Tạm tính theo logic cũ của bạn (Tồn kho < 20 là bán chạy), 
      //    hoặc bạn có thể sửa thành COUNT từ bảng ChiTietHoaDon nếu muốn chính xác hơn.
      const sql = `
        SELECT 
          COUNT(*) as TongSanPham,
          COALESCE(SUM(GiaBan * SoLuongTon), 0) as TongGiaTri,
          COUNT(CASE WHEN SoLuongTon > 0 AND SoLuongTon <= 20 THEN 1 END) as SapHetHang,
          COUNT(CASE WHEN SoLuongTon > 0 AND SoLuongTon <= 50 THEN 1 END) as BanChay
        FROM SanPham
      `;
      
      const [rows] = await db.query(sql);
      return rows[0]; // Trả về object { TongSanPham: 5, TongGiaTri: 785000000... }
    } catch (err) {
      logger.error("Repository Error: getGeneralStats failed", err);
      throw err;
    }
  },
};
