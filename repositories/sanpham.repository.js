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
  searchAdvanced: async ({ ten, giaMin, giaMax, tonKhoMin, offset, limit }) => {
    logger.info("Repository: Advanced searching SanPham with specific criteria");
    try {
      const db = await pool;
      let query = "SELECT * FROM SanPham WHERE 1=1";
      const params = [];

      // 1. Tìm theo tên sản phẩm (tương đối)
      if (ten) {
        query += " AND TenSanPham LIKE ?";
        params.push(`%${ten}%`);
      }

      // 2. Tìm trong khoảng giá (GiaBan)
      if (giaMin !== undefined && giaMin !== null) {
        query += " AND GiaBan >= ?";
        params.push(giaMin);
      }
      if (giaMax !== undefined && giaMax !== null) {
        query += " AND GiaBan <= ?";
        params.push(giaMax);
      }

      // 3. Tìm số lượng tồn kho lớn hơn số nhập vào
      if (tonKhoMin !== undefined && tonKhoMin !== null) {
        query += " AND SoLuongTon > ?";
        params.push(tonKhoMin);
      }

      // Thêm phân trang để tối ưu hiệu suất
      query += " LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const [rows] = await db.query(query, params);

      // Đếm tổng để hỗ trợ hiển thị số trang ở Frontend
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM SanPham WHERE 1=1");
      
      return {
        products: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: searchAdvanced failed", err);
      throw err;
    }
  },
  create: async ({ MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa }) => {
    logger.info(`Repository: Creating SanPham ${MaSP}`);
    try {
      const db = await pool;
      await db.query(
        "INSERT INTO SanPham ( MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [ MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa ]
      );
      return {  MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa  };
    } catch (err) {
      logger.error("Repository Error: create failed", err);
      throw err;
    }
  },

  update: async (MaSP, {TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa}) => {
    logger.info(`Repository: Updating SanPham ${MaSP}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE SanPham SET TenSanPham = ?, MaDM = ?, MaNCC = ?, GiaBan = ?, SoLuongTon = ?, NgayNhap = ?, MoTa = ? WHERE MaSP = ?",
        [TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa, MaSP]
      );
      return { MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa };
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
        ORDER BY sp.NgayNhap DESC
      `;
      const [rows] = await db.query(sql);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAllForExport failed", err);
      throw err;
    }
  }
};
