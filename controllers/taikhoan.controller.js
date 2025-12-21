import { CreateTaiKhoanDTO } from "../dtos/taikhoan/create-taikhoan.dto.js";
import { UpdateTaiKhoanDTO } from "../dtos/taikhoan/update-taikhoan.dto.js";

import { TaiKhoanService } from "../services/taikhoan.service.js";
import { validateCreateTaiKhoan } from "../validators/taikhoan/create-taikhoan.validator.js";
import { validateUpdateTaiKhoan } from "../validators/taikhoan/update-taikhoan.validator.js";

import { logger } from "../config/logger.js";

export const TaiKhoanController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /TaiKhoans");
      const TaiKhoans = await TaiKhoanService.getAllTaiKhoans();
      res.json(TaiKhoans);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaTK = req.params.MaTK;
    logger.info(`Controller: GET /TaiKhoans/${MaTK}`);

    try {
      const TaiKhoan = await TaiKhoanService.getTaiKhoanByMa(MaTK);
      res.json(TaiKhoan);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaTK})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  postLogin: async (req, res) => {
    try {
      const { TenDangNhap, MatKhau } = req.body; // Lấy thông tin từ body request
      logger.info(`Controller: POST /Login for ${TenDangNhap}`); //
      
      const result = await TaiKhoanService.login(TenDangNhap, MatKhau); //
      
      res.json({
        message: "Đăng nhập thành công",
        user: result
      });
    } catch (err) {
      logger.error("Controller Error: login failed", err); //
      res.status(401).json({ message: err.message }); // 401: Unauthorized
    }
  },

  getPaginated: async (req, res) => {
    try {
      // Mặc định là trang 1 nếu không truyền tham số page
      const page = parseInt(req.query.page) || 1; 
      
      logger.info(`Controller: GET /TaiKhoans?page=${page}`);
      
      const result = await TaiKhoanService.getTaiKhoansByPage(page);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPaginated failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      logger.info("Controller: POST /TaiKhoans");
      const validatedData = validateCreateTaiKhoan(req.body);
      const dto = new CreateTaiKhoanDTO(validatedData);
      const TaiKhoan = await TaiKhoanService.createTaiKhoan(dto);
      res.status(201).json(TaiKhoan);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaTK = req.params.MaTK;
    logger.info(`Controller: PUT /TaiKhoans/${MaTK}`);
    try {
      const validatedData = validateUpdateTaiKhoan(req.body);
      const dto = new UpdateTaiKhoanDTO(validatedData);
      const TaiKhoan = await TaiKhoanService.updateTaiKhoan(MaTK, dto);
      res.json(TaiKhoan);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaTK})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaTK = req.params.MaTK;
    logger.info(`Controller: DELETE /TaiKhoans/${MaTK}`);
    try {
      const result = await TaiKhoanService.deleteTaiKhoan(MaTK);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaTK})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};