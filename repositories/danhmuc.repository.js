import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";

const generateNextId = async (connection, table, column, prefix) => {
  const query = `SELECT ${column} FROM ${table} ORDER BY LENGTH(${column}) DESC, ${column} DESC LIMIT 1`;
  const [rows] = await connection.query(query);
  let nextId = 1;
  if (rows.length > 0) {
    const lastCode = rows[0][column]; 
    const lastNumber = parseInt(lastCode.replace(/\D/g, '')); 
    if (!isNaN(lastNumber)) nextId = lastNumber + 1;
  }
  return prefix + String(nextId).padStart(3, '0');
};

export const DanhMucRepository = {
  getAll: async () => {
    logger.info("Repository: Fetching all DanhMuc");
    try {
      const db = await pool;
      const query = `
        SELECT 
            d.MaDM, d.TenDanhMuc, d.MoTa,
           
            COUNT(DISTINCT s.MaSP) as SoSanPham,
            COALESCE(SUM(cthd.ThanhTien), 0) as DoanhThu
        FROM DanhMuc d
        LEFT JOIN SanPham s ON d.MaDM = s.MaDM
        LEFT JOIN ChiTietHoaDon cthd ON s.MaSP = cthd.MaSP
        LEFT JOIN HoaDon hd ON cthd.MaHD = hd.MaHD AND hd.TrangThai = 'HoanThanh'
        GROUP BY d.MaDM, d.TenDanhMuc, d.MoTa
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll DanhMuc failed", err);
      throw err;
    }
  },

  getByMa: async (MaDM) => {
    logger.info(`Repository: Fetching DanhMuc with MaDM ${MaDM}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM DanhMuc WHERE MaDM = ?", [MaDM]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaDM ${MaDM}`, err);
      throw err;
    }
  },
  // 3. Tìm kiếm theo tên
  searchByName: async (ten) => {
    logger.info(`Repository: Searching DanhMuc by name: ${ten}`);
    try {
      const db = await pool;
      const query = `
        SELECT 
            d.MaDM, d.TenDanhMuc, d.MoTa,
            COUNT(DISTINCT s.MaSP) as SoSanPham,
            COALESCE(SUM(cthd.ThanhTien), 0) as DoanhThu
        FROM DanhMuc d
        LEFT JOIN SanPham s ON d.MaDM = s.MaDM
        LEFT JOIN ChiTietHoaDon cthd ON s.MaSP = cthd.MaSP
        WHERE d.TenDanhMuc LIKE ?
        GROUP BY d.MaDM, d.TenDanhMuc, d.MoTa
      `;
      const [rows] = await db.query(query, [`%${ten}%`]);
      return rows;
    } catch (err) {
      logger.error("Repository Error: searchByName failed", err);
      throw err;
    }
  },

  // 4. Phân trang
  getPaginated: async (offset, limit) => {
    logger.info(`Repository: Fetching DanhMuc with offset ${offset}, limit ${limit}`);
    try {
      const db = await pool;
      
      // Query lấy dữ liệu chi tiết
      const queryData = `
        SELECT 
            d.MaDM, d.TenDanhMuc, d.MoTa,
            COUNT(DISTINCT s.MaSP) as SoSanPham,
            COALESCE(SUM(cthd.ThanhTien), 0) as DoanhThu
        FROM DanhMuc d
        LEFT JOIN SanPham s ON d.MaDM = s.MaDM
        LEFT JOIN ChiTietHoaDon cthd ON s.MaSP = cthd.MaSP
        GROUP BY d.MaDM, d.TenDanhMuc, d.MoTa
        LIMIT ? OFFSET ?
      `;
      // Ép kiểu số nguyên
      const [rows] = await db.query(queryData, [parseInt(limit), parseInt(offset)]);
      
      // Query đếm tổng số bản ghi
      const [countRows] = await db.query("SELECT COUNT(*) as total FROM DanhMuc");
      
      return {
        danhMucs: rows,
        totalItems: countRows[0].total
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },


  
  create: async ({ MaDM, TenDanhMuc, MoTa }) => {
    const db = await pool;
    const newId = MaDM || await generateNextId(db, 'DanhMuc', 'MaDM', 'DM');

    logger.info(`Repository: Creating DanhMuc ${newId}`);
    try {
      await db.query(
        "INSERT INTO DanhMuc (MaDM, TenDanhMuc, MoTa) VALUES (?, ?, ?)",
        [newId, TenDanhMuc, MoTa]
      );
      return { MaDM: newId, TenDanhMuc, MoTa };
    } catch (err) {
      logger.error("Repository Error: create DanhMuc failed", err);
      throw err;
    }
  },

  update: async (MaDM, { TenDanhMuc, MoTa }) => {
    logger.info(`Repository: Updating DanhMuc ${MaDM}`);
    try {
      const db = await pool;
      await db.query(
        "UPDATE DanhMuc SET TenDanhMuc = ?, MoTa = ? WHERE MaDM = ?",
        [TenDanhMuc, MoTa, MaDM]
      );
      return { MaDM, TenDanhMuc, MoTa };
    } catch (err) {
      logger.error(`Repository Error: update DanhMuc failed for MaDM ${MaDM}`, err);
      throw err;
    }
  },

  delete: async (MaDM) => {
    logger.info(`Repository: Deleting DanhMuc ${MaDM}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM DanhMuc WHERE MaDM = ?", [MaDM]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete DanhMuc failed for MaDM ${MaDM}`, err);
      throw err;
    }
  },

  // Thống kê tổng quan danh mục
  getGeneralStats: async () => {
    logger.info("Repository: Getting general stats for DanhMuc");
    try {
      const db = await pool;

      // 1. Tổng danh mục
      const [dmRows] = await db.query(
        "SELECT COUNT(*) AS TongDanhMuc FROM DanhMuc"
      );

      // 2. Tổng sản phẩm
      const [spRows] = await db.query(
        "SELECT COUNT(*) AS TongSanPham FROM SanPham"
      );

      // 3. Tổng doanh thu (LẤY TỪ HÓA ĐƠN)
      const [dtRows] = await db.query(
        `SELECT COALESCE(SUM(TongTien), 0) AS TongDoanhThu 
       FROM HoaDon 
       WHERE TrangThai = 'HoanThanh'`
      );

      return {
        TongDanhMuc: dmRows[0].TongDanhMuc || 0,
        TongSanPham: spRows[0].TongSanPham || 0,
        TongDoanhThu: dtRows[0].TongDoanhThu || 0
      };
    } catch (err) {
      logger.error("Repository Error: getGeneralStats failed", err);
      throw err;
    }
  },
  getDetailCustom1: async (MaDM) => {
    logger.info(`Repository: Fetching Custom Detail for ${MaDM}`);
    try {
      const db = await pool;

      // 1. Lấy thông tin danh mục + Thống kê (Giả lập TrangThai = 'active')
      const queryInfo = `
        SELECT 
            d.MaDM, d.TenDanhMuc, d.MoTa, 
            COUNT(DISTINCT s.MaSP) as SoSanPham,
            COALESCE(SUM(cthd.ThanhTien), 0) as DoanhThu
        FROM DanhMuc d
        LEFT JOIN SanPham s ON d.MaDM = s.MaDM
        LEFT JOIN ChiTietHoaDon cthd ON s.MaSP = cthd.MaSP
        LEFT JOIN HoaDon hd ON cthd.MaHD = hd.MaHD AND hd.TrangThai = 'HoanThanh'
        WHERE d.MaDM = ?
        GROUP BY d.MaDM, d.TenDanhMuc, d.MoTa
      `;
      const [infoRows] = await db.query(queryInfo, [MaDM]);

      // Nếu không tìm thấy danh mục
      if (infoRows.length === 0) return null;

      // 2. Lấy danh sách 10 sản phẩm tiêu biểu
      const queryProducts = `
        SELECT MaSP, TenSanPham, GiaBan, SoLuongTon, HinhAnh
        FROM SanPham 
        WHERE MaDM = ?
       
        LIMIT 10
      `;
      const [productRows] = await db.query(queryProducts, [MaDM]);

      // 3. Gộp kết quả
      return {
        ...infoRows[0],
        SanPhams: productRows
      };

    } catch (err) {
      logger.error("Repository Error: getDetailCustom failed", err);
      throw err;
    }
  },

  // --- API CHI TIẾT ĐA NĂNG (Hỗ trợ Limit hoặc Lấy hết) ---
  getDetailCustom: async (MaDM, limit = null) => {
    logger.info(`Repository: Fetching Custom Detail for ${MaDM} with limit ${limit}`);
    try {
      const db = await pool;

      // 1. Lấy thông tin danh mục (Giữ nguyên)
      const queryInfo = `
        SELECT 
            d.MaDM, d.TenDanhMuc, d.MoTa, 
            'active' as TrangThai,
            COUNT(DISTINCT s.MaSP) as SoSanPham,
            COALESCE(SUM(cthd.ThanhTien), 0) as DoanhThu
        FROM DanhMuc d
        LEFT JOIN SanPham s ON d.MaDM = s.MaDM
        LEFT JOIN ChiTietHoaDon cthd ON s.MaSP = cthd.MaSP
        LEFT JOIN HoaDon hd ON cthd.MaHD = hd.MaHD AND hd.TrangThai = 'HoanThanh'
        WHERE d.MaDM = ?
        GROUP BY d.MaDM, d.TenDanhMuc, d.MoTa
      `;
      const [infoRows] = await db.query(queryInfo, [MaDM]);
      if (infoRows.length === 0) return null;

      // 2. Lấy danh sách sản phẩm (XỬ LÝ ĐỘNG PHẦN LIMIT)
      let queryProducts = `
        SELECT 
            s.MaSP, s.TenSanPham, s.GiaBan, s.SoLuongTon, s.HinhAnh,
            ncc.TenNhaCungCap,
            COALESCE(SUM(cthd.ThanhTien), 0) as DoanhThuSanPham,
            COALESCE(SUM(cthd.SoLuong), 0) as DaBan  -- <--- THÊM DÒNG NÀY
        FROM SanPham s
        LEFT JOIN NhaCungCap ncc ON s.MaNCC = ncc.MaNCC
        LEFT JOIN ChiTietHoaDon cthd ON s.MaSP = cthd.MaSP
        LEFT JOIN HoaDon hd ON cthd.MaHD = hd.MaHD AND hd.TrangThai = 'HoanThanh'
        WHERE s.MaDM = ?
        GROUP BY s.MaSP, s.TenSanPham, s.GiaBan, s.SoLuongTon, s.HinhAnh, ncc.TenNhaCungCap
        ORDER BY s.MaSP ASC
      `;

      // Tạo mảng tham số cho câu query
      const params = [MaDM];

      // Nếu có truyền limit thì nối thêm LIMIT ? vào SQL
      if (limit && limit > 0) {
          queryProducts += ` LIMIT ?`;
          params.push(parseInt(limit));
      }

      const [productRows] = await db.query(queryProducts, params);

      // 3. Gộp kết quả
      return {
        ...infoRows[0],
        SanPhams: productRows
      };

    } catch (err) {
      logger.error("Repository Error: getDetailCustom failed", err);
      throw err;
    }
  },
};