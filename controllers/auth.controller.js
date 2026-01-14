import { AuthService } from "../services/auth.service.js";
import { logger } from "../config/logger.js";

// Đăng ký (Chỉ dành cho Khách hàng)
export async function registerUser(req, res) {
  try {
    // Dữ liệu req.body đã được validate qua middleware trước đó
    const result = await AuthService.register(req.body);
    
    res.status(201).json({
      message: "Đăng ký thành công",
      data: {
        username: result.username,
        role: "KhachHang"
      }
    });
  } catch (error) {
    logger.error("Register Error:", error);
    res.status(400).json({ message: error.message });
  }
}

// Đăng nhập
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    const result = await AuthService.login(username, password);

    res.json({
      message: "Đăng nhập thành công",
      token: result.token,
      user: {
        id: result.user.id,
        username: result.user.username,
        role_id: result.user.role_id
      }
    });
  } catch (error) {
    logger.error("Login Error:", error);
    // Trả về 401 Unauthorized để Client biết đường xử lý
    res.status(401).json({ message: error.message });
  }
}