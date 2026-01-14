import { TaiKhoanRepository } from "../repositories/taikhoan.repository.js";
import { TaiKhoanDTO } from "../dtos/taikhoan/taikhoan.dto.js";
import { logger } from "../config/logger.js";
import bcrypt from "bcryptjs"; // Cần import để hash pass nếu update
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "BI_MAT_KHONG_BAT_MI";

export const TaiKhoanService = {
  getAllTaiKhoans: async () => {
    logger.info("Service: Getting all TaiKhoans");
    const taiKhoans = await TaiKhoanRepository.getAll();
    return taiKhoans.map((u) => new TaiKhoanDTO(u));
  },

  getTaiKhoanByMa: async (MaTK) => {
    logger.info(`Service: Getting TaiKhoan by Ma ${MaTK}`);
    const taiKhoan = await TaiKhoanRepository.getByMa(MaTK);

    if (!taiKhoan) {
      logger.warn(`Service Warning: TaiKhoan ${MaTK} not found`);
      throw new Error("TaiKhoan not found");
    }

    return new TaiKhoanDTO(taiKhoan);
  },

  login: async (TenDangNhap, MatKhau) => {
    logger.info(`Service: Processing login for user ${TenDangNhap}`);
    
    // 1. Tìm user
    const taiKhoan = await TaiKhoanRepository.findByUsername(TenDangNhap);
    if (!taiKhoan) {
      throw new Error("Tên đăng nhập không chính xác");
    }

    // 2. Check Active
    if (!taiKhoan.is_active) {
      throw new Error("Tài khoản của bạn đã bị khóa");
    }

    // 3. Check Pass (Dùng bcrypt thay vì so sánh ===)
    const isValid = bcrypt.compareSync(MatKhau, taiKhoan.password_hash);
    if (!isValid) {
      throw new Error("Mật khẩu không chính xác");
    }

    // 4. Tạo Token
    const token = jwt.sign(
      { 
        id: taiKhoan.id,
        sub: taiKhoan.user_ref_id,
        role: taiKhoan.role_id 
      },
      SECRET_KEY,
      { expiresIn: "8h" }
    );

    return { token, user: new TaiKhoanDTO({ ...taiKhoan, MaTK: taiKhoan.id }) };
  },

  getTaiKhoansByPage: async (page) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    logger.info(`Service: Pagination - Page ${page}, Size ${pageSize}`);
    
    const { taiKhoans, totalItems } = await TaiKhoanRepository.getPaginated(offset, pageSize);

    return {
      data: taiKhoans.map((u) => new TaiKhoanDTO(u)),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize: pageSize
      }
    };
  },
  
  createTaiKhoan: async (data) => {
    logger.info(`Service: Create Account for ${data.TenDangNhap}`);

    // 1. Kiểm tra username đã tồn tại chưa
    const existingUser = await TaiKhoanRepository.findByUsername(data.TenDangNhap);
    if (existingUser) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }

    // 2. Kiểm tra Nhân viên này đã có tài khoản chưa (Một nhân viên chỉ nên có 1 tài khoản)
    const existingRef = await TaiKhoanRepository.getByUserRef(data.MaNV);
    if (existingRef) {
      throw new Error(`Nhân viên ${data.MaNV} đã có tài khoản rồi (${existingRef.TenDangNhap})`);
    }

    // 3. Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(data.MatKhau, salt);

    // 4. Chuyển đổi Quyền hạn (Từ chuỗi 'admin' sang ID 1, 2...)
    // Hàm getRoleId bạn đã có trong roles.js
    let roleId = 2; // Mặc định nhân viên
    if (data.QuyenHan === 'admin') roleId = 1;
    else if (data.QuyenHan === 'manager') roleId = 1;
    else if (data.QuyenHan === 'sales') roleId = 2;
    // ... logic map role tùy bạn

    // 5. Gọi Repository để lưu
    const newAccountData = {
      MaTK: data.MaTK,
      UserRefId: data.MaNV, // Lưu vào cột MaNV hoặc UserRefId tùy DB
      TenDangNhap: data.TenDangNhap,
      MatKhau: hashedPassword,
      QuyenHan: roleId, // Lưu ID quyền
      TrangThai: data.TrangThai === 'active' || data.TrangThai == 1 ? 1 : 0
    };

    // Bạn cần đảm bảo Repository có hàm create (insert)
    // Nếu repo chưa có hàm create riêng lẻ, dùng hàm insert cơ bản
    return await TaiKhoanRepository.create(newAccountData);
  },

  updateTaiKhoan: async (MaTK, dto) => {
    logger.info(`Service: Updating TaiKhoan ${MaTK}`);

    const existing = await TaiKhoanRepository.getByMa(MaTK);
    if (!existing) {
      throw new Error("TaiKhoan not found");
    }

    // Nếu có đổi pass thì hash lại
    if (dto.MatKhau) {
        const salt = bcrypt.genSaltSync(10);
        dto.MatKhau = bcrypt.hashSync(dto.MatKhau, salt);
    }

    const updated = await TaiKhoanRepository.update(MaTK, dto);
    return new TaiKhoanDTO(updated);
  },

  deleteTaiKhoan: async (MaTK) => {
    logger.info(`Service: Deleting TaiKhoan ${MaTK}`);
    const existing = await TaiKhoanRepository.getByMa(MaTK);
    if (!existing) throw new Error("TaiKhoan not found");

    await TaiKhoanRepository.delete(MaTK);
    return { message: "TaiKhoan deleted successfully" };
  },
};