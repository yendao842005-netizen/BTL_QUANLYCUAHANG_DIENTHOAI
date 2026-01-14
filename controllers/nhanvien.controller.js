import { CreateNhanVienDTO } from "../dtos/nhanvien/create-nhanvien.js"; // Giả sử chung file dto hoặc tách ra tùy bạn
import { UpdateNhanVienDTO } from "../dtos/nhanvien/update-nhanviendto.js";
import { NhanVienService } from "../services/nhanvien.service.js";
import { validateCreateNhanVien } from "../validators/nhanvien/create-nhanvien.validator.js"; // Giả sử file validator
import { validateUpdateNhanVien } from "../validators/nhanvien/update-nhanvien.validator.js"; // Giả sử file validator
import { NhanVienRepository } from "../repositories/nhanvien.repository.js";
import { TaiKhoanRepository } from "../repositories/taikhoan.repository.js"; // Nhớ import cái này
import bcrypt from "bcryptjs";
import { logger } from "../config/logger.js";

export const NhanVienController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /NhanViens");
      const NhanViens = await NhanVienService.getAllNhanViens();
      res.json(NhanViens);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaNV = req.params.MaNV; // Bỏ dấu + vì MaNV là string
    logger.info(`Controller: GET /NhanViens/${MaNV}`);

    try {
      const NhanVien = await NhanVienService.getNhanVienByMa(MaNV);
      res.json(NhanVien);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaNV})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  search: async (req, res) => {
    try {
      logger.info("Controller: GET /NhanViens/Search");

      // Lấy các tham số từ URL (VD: ?hoTen=An&gioiTinh=Nam)
      const filters = {
        hoTen: req.query.hoTen,
        tuNgaySinh: req.query.tuNgaySinh,
        gioiTinh: req.query.gioiTinh,
        diaChi: req.query.diaChi,
        chucVu: req.query.chucVu,
      };

      const results = await NhanVienService.searchNhanViens(filters);
      res.json(results);
    } catch (err) {
      logger.error("Controller Error: search failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getPaginated: async (req, res) => {
    try {
      // Lấy số trang từ URL (?page=1), mặc định là 1
      const page = parseInt(req.query.page) || 1;

      logger.info(`Controller: GET /NhanViens/PhanTrang?page=${page}`);

      const result = await NhanVienService.getNhanViensByPage(page);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPaginated failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      logger.info("Controller: Creating new NhanVien via Service");
      
      // 1. Chuẩn bị dữ liệu để gọi Service
      // Frontend gửi lên 'password_hash' chứa mật khẩu thô, 
      // nhưng Service cần trường 'password' để kích hoạt logic mã hóa.
      const serviceData = {
        ...req.body,
        password: req.body.password_hash // Map password_hash (thô) sang password
      };

      // 2. Gọi qua Service (để Service lo việc mã hóa, validate, gọi repo)
      const result = await NhanVienService.createNhanVien(serviceData);

      res.status(201).json({ 
        message: "Tạo nhân viên và tài khoản thành công", 
        data: result 
      });

    } catch (err) {
      logger.error("Controller Error: create NhanVien failed", err);
      // Trả về lỗi 500 hoặc 400 tùy ngữ cảnh
      res.status(500).json({ message: err.message || "Lỗi hệ thống" });
    }
  },

  update: async (req, res) => {
    // Sửa 'id' thành 'MaNV' cho khớp với Router và các hàm khác
    const MaNV = req.params.MaNV; 
    const data = req.body;
    try {
      // 1. Cập nhật thông tin nhân viên
      const updatedNV = await NhanVienRepository.update(MaNV, data);

      // 2. Cập nhật thông tin tài khoản (Nếu có gửi lên)
      if (data.role_id !== undefined || data.password_hash || data.TrangThai !== undefined) {
          // Tìm tài khoản theo Mã NV (Dùng biến MaNV vừa sửa)
          const account = await TaiKhoanRepository.getByUserRef(MaNV);
          
          if (account) {
              const tkUpdateData = {};
              if (data.password_hash) tkUpdateData.MatKhau = data.password_hash;
              // Sửa logic map quyền: data.role_id từ frontend gửi lên là số (1,2)
              // Nhưng Database lưu chuỗi 'admin'/'manager' hoặc số tùy thiết kế. 
              // Dựa vào file taikhoan.service.js, bạn lưu số role_id vào cột QuyenHan? 
              // Nếu repository update chỉ nhận giá trị thô, hãy gán trực tiếp:
              if (data.role_id) tkUpdateData.QuyenHan = data.role_id; 
              
              if (data.TrangThai !== undefined) tkUpdateData.TrangThai = data.TrangThai;

              await TaiKhoanRepository.update(account.MaTK, tkUpdateData);
          }
      }

      res.status(200).json(updatedNV);
    } catch (err) {
      // Thêm log lỗi để dễ debug
      logger.error("Controller Error: update failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaNV = req.params.MaNV;
    logger.info(`Controller: DELETE /NhanViens/${MaNV}`);

    try {
      const result = await NhanVienService.deleteNhanVien(MaNV);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaNV})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  resetPassword: async (req, res) => {
    const MaNV = req.params.MaNV;
    const { newPassword } = req.body;

    logger.info(`Controller: Resetting password for ${MaNV}`);

    try {
      await NhanVienService.resetPassword(MaNV, newPassword);
      res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
      logger.error(`Controller Error: resetPassword failed (${MaNV})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  // API: /NhanViens/BaoCao/HieuSuat
  getPerformanceReport: async (req, res) => {
    try {
      // Lấy tham số từ Query String
      //  ?startDate=2024-01-01&endDate=2024-12-31
      const { startDate, endDate } = req.query;

      const result = await NhanVienService.analyzePerformance(
        startDate,
        endDate
      );

      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPerformanceReport failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // xuat elxel
  // API: /NhanViens/Export/Excel
  exportToExcel: async (req, res) => {
    try {
      const workbook = await NhanVienService.generateExcel();
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=NhanVien_${Date.now()}.xlsx`
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ message: "Lỗi xuất Excel: " + err.message });
    }
  },
   getDashboardStats: async (req, res) => {
      try {
        const stats = await NhanVienService.getDashboardStats();
        res.json(stats);
      } catch (err) {
        logger.error("Controller Error: getDashboardStats failed", err);
        res.status(500).json({ message: err.message });
      }
    },
    // API: GET /NhanViens/Stats/TopRevenue?limit=5
      getTopRevenue: async (req, res) => {
        try {
          const { limit } = req.query; // Lấy tham số limit từ URL (nếu có)
          const result = await NhanVienService.getTopEmployeesByRevenue(limit);
          res.json(result);
        } catch (err) {
          logger.error("Controller Error: getTopRevenue failed", err);
          res.status(500).json({ message: err.message });
        }
      },
};
