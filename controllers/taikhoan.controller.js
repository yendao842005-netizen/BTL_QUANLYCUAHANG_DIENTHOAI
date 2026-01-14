import { UpdateTaiKhoanDTO } from "../dtos/taikhoan/update-taikhoan.dto.js";
import { TaiKhoanService } from "../services/taikhoan.service.js";
import { validateUpdateTaiKhoan } from "../validators/taikhoan/update-taikhoan.validator.js";
import { logger } from "../config/logger.js";

export const TaiKhoanController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /TaiKhoans");
      const result = await TaiKhoanService.getAllTaiKhoans();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaTK = req.params.MaTK;
    try {
      const result = await TaiKhoanService.getTaiKhoanByMa(MaTK);
      res.json(result);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  // Hàm login này có thể giữ để gọi Service (hoặc dùng AuthController riêng như bài trước)
  postLogin: async (req, res) => {
    try {
      const { TenDangNhap, MatKhau } = req.body;
      const result = await TaiKhoanService.login(TenDangNhap, MatKhau);

      res.json({
        message: "Đăng nhập thành công",
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  },

  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await TaiKhoanService.getTaiKhoansByPage(page);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      logger.info("Controller: Creating new Account");
      // Dữ liệu từ form: { MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai, ... }
      const result = await TaiKhoanService.createTaiKhoan(req.body);
      
      res.status(201).json({ 
        message: "Tạo tài khoản thành công", 
        data: result 
      });
    } catch (err) {
      // Nếu lỗi trùng lặp hoặc lỗi logic
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaTK = req.params.MaTK;
    try {
      const validatedData = validateUpdateTaiKhoan(req.body);
      const dto = new UpdateTaiKhoanDTO(validatedData);
      const result = await TaiKhoanService.updateTaiKhoan(MaTK, dto);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaTK = req.params.MaTK;
    try {
      const result = await TaiKhoanService.deleteTaiKhoan(MaTK);
      res.json(result);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },
};
