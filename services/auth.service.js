import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TaiKhoanRepository } from "../repositories/taikhoan.repository.js";
import { logger } from "../config/logger.js";

const SECRET_KEY = process.env.JWT_SECRET || "BI_MAT_KHONG_BAT_MI";

export const AuthService = {
  
  // 1. Đăng ký Khách hàng (Public)
  register: async (dto) => {
    logger.info(`AuthService: Registering customer ${dto.username}`);

    // Check trùng username
    const existingUser = await TaiKhoanRepository.findByUsername(dto.username);
    if (existingUser) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }

    // Mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(dto.password, salt);

    // Gọi Repository để tạo KhachHang + TaiKhoan
    const result = await TaiKhoanRepository.registerCustomer({
      ...dto,
      password_hash: hashedPassword
    });

    return result;
  },

  // 2. Đăng nhập (Dùng chung cho cả Admin, NV, Khách)
  login: async (username, password) => {
    logger.info(`AuthService: Login attempt for ${username}`);

    // Tìm user
    const user = await TaiKhoanRepository.findByUsername(username);
    if (!user) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    // Check khóa
    if (!user.is_active) {
      throw new Error("Tài khoản đã bị khóa");
    }

    // Check pass
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    // Tạo Token
    const token = jwt.sign(
      { 
        id: user.id,           // MaTK
        sub: user.user_ref_id, // MaNV/MaKH
        role: user.role_id     // 1, 2, 3
      },
      SECRET_KEY,
      { expiresIn: "8h" }
    );

    return { token, user };
  }
};