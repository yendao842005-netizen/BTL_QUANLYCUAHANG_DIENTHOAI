import { CreateNhanVienDTO } from "../dtos/nhanvien/create-nhanvien.js"; // Giả sử chung file dto hoặc tách ra tùy bạn
import { UpdateNhanVienDTO } from "../dtos/nhanvien/update-nhanviendto.js";
import { NhanVienService } from "../services/nhanvien.service.js";
import { validateCreateNhanVien } from "../validators/nhanvien/create-nhanvien.validator.js"; // Giả sử file validator
import {  validateUpdateNhanVien } from "../validators/nhanvien/update-nhanvien.validator.js"; // Giả sử file validator
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
        chucVu: req.query.chucVu
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
      logger.info("Controller: POST /NhanViens");

      // VALIDATE INPUT
      const validatedData = validateCreateNhanVien(req.body);

      // CREATE DTO
      const dto = new CreateNhanVienDTO(validatedData);

      const NhanVien = await NhanVienService.createNhanVien(dto);
      res.status(201).json(NhanVien);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaNV = req.params.MaNV;
    logger.info(`Controller: PUT /NhanViens/${MaNV}`);

    try {
      // VALIDATE INPUT
      const validatedData = validateUpdateNhanVien(req.body);

      // CREATE DTO
      const dto = new UpdateNhanVienDTO(validatedData);

      const NhanVien = await NhanVienService.updateNhanVien(MaNV, dto);
      res.json(NhanVien);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaNV})`, err);
      res.status(400).json({ message: err.message });
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


  // API: /NhanViens/BaoCao/HieuSuat
  getPerformanceReport: async (req, res) => {
    try {
      // Lấy tham số từ Query String
      //  ?startDate=2024-01-01&endDate=2024-12-31
      const { startDate, endDate } = req.query;

      const result = await NhanVienService.analyzePerformance(startDate, endDate);
      
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
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=NhanVien_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ message: "Lỗi xuất Excel: " + err.message });
    }
  }
};