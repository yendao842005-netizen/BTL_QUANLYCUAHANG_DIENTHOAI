import { pool } from "../config/database.js";
import { logger } from "../config/logger.js";
import { getRoleId, getRoleName, ROLES } from "../utils/constants/roles.js";

// --- HÀM HỖ TRỢ SINH MÃ TỰ ĐỘNG (Helper) ---
// connection: kết nối database (có thể là pool hoặc transaction connection)
// table: tên bảng (VD: 'TaiKhoan')
// column: tên cột khóa chính (VD: 'MaTK')
// prefix: tiền tố (VD: 'TK')
const generateNextId = async (connection, table, column, prefix) => {
  // Lấy dòng có mã lớn nhất (Sắp xếp giảm dần theo chuỗi)
  // Lưu ý: Sắp xếp chuỗi 'TK9' sẽ lớn hơn 'TK10', nên cần cẩn thận.
  // Cách chuẩn nhất là lấy độ dài rồi lấy giá trị.
  // Nhưng để đơn giản và hiệu quả với định dạng cố định (TK001), ta dùng ORDER BY length và value.

  const query = `SELECT ${column} FROM ${table} ORDER BY LENGTH(${column}) DESC, ${column} DESC LIMIT 1`;
  const [rows] = await connection.query(query);

  let nextId = 1;
  if (rows.length > 0) {
    const lastCode = rows[0][column]; // VD: TK013
    // Cắt bỏ phần chữ, lấy phần số
    const lastNumber = parseInt(lastCode.replace(/\D/g, ""));
    if (!isNaN(lastNumber)) {
      nextId = lastNumber + 1;
    }
  }
  // Trả về định dạng: Prefix + 3 số (001, 014, 100)
  return prefix + String(nextId).padStart(3, "0");
};

// --- QUAN TRỌNG: Tên biến export phải là TaiKhoanRepository ---
export const TaiKhoanRepository = {
  // 1. Lấy tất cả tài khoản (Dùng cho Admin xem danh sách)
  getAll: async () => {
    logger.info("Repository: Fetching all TaiKhoan");
    try {
      const db = await pool;
      const query = `SELECT * FROM TaiKhoan`;
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      logger.error("Repository Error: getAll failed", err);
      throw err;
    }
  },

  // 2. Tìm theo Mã TK (Dùng cho chi tiết)
  getByMa: async (MaTK) => {
    logger.info(`Repository: Fetching TaiKhoan with MaTK ${MaTK}`);
    try {
      const db = await pool;
      const [rows] = await db.query("SELECT * FROM TaiKhoan WHERE MaTK = ?", [
        MaTK,
      ]);
      return rows[0];
    } catch (err) {
      logger.error(`Repository Error: getByMa failed for MaTK ${MaTK}`, err);
      throw err;
    }
  },

  // 3. Tìm theo Username (Dùng cho Login)
  findByUsername: async (username) => {
    const query = `
      SELECT MaTK, MaNV, MaKH, TenDangNhap, MatKhau, QuyenHan, TrangThai 
      FROM TaiKhoan 
      WHERE TenDangNhap = ?
    `;
    const [rows] = await pool.execute(query, [username]);

    if (rows.length === 0) return null;

    const acc = rows[0];
    return {
      id: acc.MaTK,
      user_ref_id: acc.MaNV || acc.MaKH, // Tự động lấy ID người dùng tương ứng
      username: acc.TenDangNhap,
      password_hash: acc.MatKhau,
      role_id: getRoleId(acc.QuyenHan), // Map từ chữ (QuanLy) sang số (1)
      // Convert Bit/Int sang Boolean chuẩn xác
      is_active:
        (acc.TrangThai && acc.TrangThai[0] === 1) || acc.TrangThai === 1,
    };
  },

  // 4. Phân trang (Dùng cho danh sách Admin)
  getPaginated: async (offset, limit) => {
    logger.info(
      `Repository: Fetching TaiKhoan with offset ${offset}, limit ${limit}`
    );
    try {
      const db = await pool;

      const queryData = "SELECT * FROM TaiKhoan LIMIT ? OFFSET ?";
      // Ép kiểu số nguyên cho limit/offset để tránh lỗi SQL syntax
      const [rows] = await db.query(queryData, [
        parseInt(limit),
        parseInt(offset),
      ]);

      const [countRows] = await db.query(
        "SELECT COUNT(*) as total FROM TaiKhoan"
      );

      return {
        taiKhoans: rows,
        totalItems: countRows[0].total,
      };
    } catch (err) {
      logger.error("Repository Error: getPaginated failed", err);
      throw err;
    }
  },

  // 5. Đăng ký KHÁCH HÀNG (Transaction)
  registerCustomer: async (data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // A. Tạo mã KH
      const maKH = await generateNextId(connection, "KhachHang", "MaKH", "KH");

      // B. Insert KhachHang
      const queryKH = `
        INSERT INTO KhachHang (MaKH, HoTen, SoDienThoai, Email, DiaChi, GioiTinh, NgaySinh) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await connection.execute(queryKH, [
        maKH,
        data.name,
        data.phone,
        data.email || null,
        data.address || null,
        data.gender || null,
        data.birthdate || null,
      ]);

      // C. Insert TaiKhoan
      const maTK = await generateNextId(connection, "TaiKhoan", "MaTK", "TK");
      const queryTK = `
        INSERT INTO TaiKhoan (MaTK, MaKH, TenDangNhap, MatKhau, QuyenHan, TrangThai)
        VALUES (?, ?, ?, ?, 'KhachHang', 1)
      `;
      await connection.execute(queryTK, [
        maTK,
        maKH,
        data.username,
        data.password_hash,
      ]);

      await connection.commit();
      return { id: maTK, username: data.username, role: ROLES.CUSTOMER };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // 6. Tạo NHÂN VIÊN (Transaction)
  createEmployee: async (data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // --- A. LOGIC TỰ TẠO MÃ NV TĂNG DẦN (NV015 -> NV016) ---
      // 1. Lấy nhân viên có mã lớn nhất hiện tại
      const maNV = await generateNextId(connection, "NhanVien", "MaNV", "NV");

      // Lấy tên Role hệ thống
      const systemRoleName = getRoleName(data.role_id) || "NhanVien";

      // --- B. Insert NhanVien (Dùng key Tiếng Việt từ data) ---
      const queryNV = `
        INSERT INTO NhanVien 
        (MaNV, HoTen, SoDienThoai, Email, DiaChi, GioiTinh, NgaySinh, LuongCoBan, ChucVu, NgayVaoLam) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_DATE))
      `;
      await connection.execute(queryNV, [
        maNV,
        data.HoTen, // <--- Sửa thành tiếng Việt
        data.SoDienThoai, // <--- Sửa thành tiếng Việt
        data.Email || null,
        data.DiaChi || null,
        data.GioiTinh || null,
        data.NgaySinh || null,
        data.LuongCoBan || 0,
        data.ChucVu || null,
        data.NgayVaoLam || null,
      ]);

      // --- C. Insert TaiKhoan ---
      const maTK = await generateNextId(connection, "TaiKhoan", "MaTK", "TK");
      const queryTK = `
        INSERT INTO TaiKhoan (MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai)
        VALUES (?, ?, ?, ?, ?, 1)
      `;
      await connection.execute(queryTK, [
        maTK,
        maNV,
        data.username,
        data.password_hash,
        systemRoleName,
      ]);

      await connection.commit();

      // Trả về dữ liệu để hiển thị
      return {
        id: maTK,
        user_ref_id: maNV, // Trả về mã NV mới sinh (NV016)
        username: data.username,
        job: data.ChucVu,
        role: data.role_id,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
  create: async (data) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // A. Tự động sinh Mã Tài Khoản (Logic quan trọng nhất)
      const maTK = await generateNextId(connection, "TaiKhoan", "MaTK", "TK");

      // B. Thực hiện Insert
      const query = `
        INSERT INTO TaiKhoan (MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai, NgayTao)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      // Lưu ý: data.QuyenHan lúc này có thể là ID (1,2) hoặc chuỗi ('admin') tùy vào Service xử lý.
      // Nhưng Repository chỉ có nhiệm vụ lưu cái Service đưa xuống.
      await connection.execute(query, [
        maTK,
        data.UserRefId,   // Service map MaNV vào đây
        data.TenDangNhap,
        data.MatKhau,     // Đã được Hash ở Service
        data.QuyenHan,
        data.TrangThai || 1
      ]);

      await connection.commit();
      
      // Trả về dữ liệu kèm MaTK vừa sinh
      return { ...data, MaTK: maTK };
      
    } catch (error) {
      await connection.rollback();
      logger.error("Repository Error: Create Account failed", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 7. Cập nhật (Update) - Chỉ cho phép update pass/role/trạng thái
  update: async (MaTK, { MatKhau, QuyenHan, TrangThai }) => {
    logger.info(`Repository: Updating TaiKhoan ${MaTK}`);
    try {
      const db = await pool;

      // Xây dựng câu query động chỉ update trường có dữ liệu
      let fields = [];
      let values = [];

      if (MatKhau) {
        fields.push("MatKhau = ?");
        values.push(MatKhau);
      }
      if (QuyenHan) {
        fields.push("QuyenHan = ?");
        values.push(QuyenHan);
      }
      if (TrangThai !== undefined) {
        fields.push("TrangThai = ?");
        values.push(TrangThai);
      }

      if (fields.length === 0) return null;

      values.push(MaTK); // Tham số cuối cho WHERE

      const query = `UPDATE TaiKhoan SET ${fields.join(", ")} WHERE MaTK = ?`;
      await db.query(query, values);

      return { MaTK, QuyenHan, TrangThai };
    } catch (err) {
      logger.error(`Repository Error: update failed for MaTK ${MaTK}`, err);
      throw err;
    }
  },

  // 8. Xóa (Delete)
  delete: async (MaTK) => {
    logger.info(`Repository: Deleting TaiKhoan ${MaTK}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM TaiKhoan WHERE MaTK = ?", [MaTK]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: delete failed for MaTK ${MaTK}`, err);
      throw err;
    }
  },

  getByUserRef: async (userRefId) => {
    // userRefId có thể là MaNV hoặc MaKH
    const query = `SELECT * FROM TaiKhoan WHERE MaNV = ? OR MaKH = ?`;
    const [rows] = await pool.execute(query, [userRefId, userRefId]);
    return rows[0]; // Trả về tài khoản tìm thấy
  },
  deleteByUserRef: async (userRefId) => {
    // userRefId có thể là MaNV hoặc MaKH
    logger.info(`Repository: Deleting Account for UserRef ${userRefId}`);
    try {
      const db = await pool;
      await db.query("DELETE FROM TaiKhoan WHERE MaNV = ? OR MaKH = ?", [
        userRefId,
        userRefId,
      ]);
      return true;
    } catch (err) {
      logger.error(`Repository Error: deleteByUserRef failed`, err);
      throw err; // Ném lỗi để Service biết
    }
  },
};
