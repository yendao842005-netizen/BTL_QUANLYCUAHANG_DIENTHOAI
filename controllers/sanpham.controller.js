import { CreateSanPhamDTO } from "../dtos/sanpham/create-sanpham.dto.js";
import { UpdateSanPhamDTO } from "../dtos/sanpham/update-sanpham.dto.js";
import { SanPhamService } from "../services/sanpham.service.js";

import { validateCreateSanPham } from "../validators/sanpham/create-sanpham.validator.js";
import { validateUpdateSanPham } from "../validators/sanpham/update-sanpham.validator.js";

import { logger } from "../config/logger.js";

export const SanPhamController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /SanPhams");
      const SanPhams = await SanPhamService.getAllSanPhams();
      res.json(SanPhams);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaSP = req.params.MaSP;
    logger.info(`Controller: GET /SanPhams/${MaSP}`);

    try {
      const SanPham = await SanPhamService.getSanPhamByMa(MaSP);
      res.json(SanPham);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaSP})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  // API Lấy danh sách (Phân trang + Sắp xếp)
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const sortBy = req.query.sortBy; // Có thể để trống để dùng mặc định MaSP
      const order = req.query.order || 'ASC';

      const result = await SanPhamService.getPaginatedList(page, sortBy, order);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  searchAdvanced: async (req, res) => {
    try {
      logger.info("Controller: GET /SanPhams/SearchAdvanced");
      
      const page = parseInt(req.query.page) || 1;
      const filters = {
        ten: req.query.ten,
        giaMin: req.query.giaMin ? parseFloat(req.query.giaMin) : null,
        giaMax: req.query.giaMax ? parseFloat(req.query.giaMax) : null,
        tonKhoMin: req.query.tonKhoMin ? parseInt(req.query.tonKhoMin) : null,
        sort: req.query.sort
      };

      const result = await SanPhamService.searchAdvancedProducts(filters, page);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: searchAdvanced failed", err);
      res.status(500).json({ message: err.message });
    }
  },
    
  create: async (req, res) => {
    try {
      logger.info("Controller: POST /SanPhams");

      // VALMaATE INPUT
      const valMaData = validateCreateSanPham(req.body);

      // CREATE DTO
      const dto = new CreateSanPhamDTO(valMaData);

      const SanPham = await SanPhamService.createSanPham(dto);
      res.status(201).json(SanPham);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaSP = req.params.MaSP;
    logger.info(`Controller: PUT /SanPhams/${MaSP}`);

    try {
      // VALMaATE INPUT
      const valMaData = validateUpdateSanPham(req.body);

      // CREATE DTO
      const dto = new UpdateSanPhamDTO(valMaData);

      const SanPham = await SanPhamService.updateSanPham(MaSP, dto);
      res.json(SanPham);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaSP})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaSP = req.params.MaSP;
    logger.info(`Controller: DELETE /SanPhams/${MaSP}`);

    try {
      const result = await SanPhamService.deleteSanPham(MaSP);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaSP})`, err);
      res.status(404).json({ message: err.message });
    }
  },

  //Hàm thống kê tồn kho
  // API: /SanPhams/ThongKe/TonKho?threshold=10
  getInventoryStats: async (req, res) => {
    try {
      const { threshold } = req.query; // Lấy tham số từ URL
      
      const result = await SanPhamService.getInventoryReport(threshold);
      
      res.json({
        message: "Thống kê tình trạng kho hàng",
        threshold: threshold || 10, // Trả lại ngưỡng để FE biết đang lọc theo số nào
        data: result
      });
    } catch (err) {
      logger.error("Controller Error: getInventoryStats failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  
  // Hàm xuất danh sách sản phẩm ra file Excel
  // API: /SanPhams/Export/Excel
  exportToExcel: async (req, res) => {
    try {
      const workbook = await SanPhamService.generateExcel();

      // Đặt tên file khi tải về
      const fileName = `DanhSachSanPham_${Date.now()}.xlsx`;

      // Thiết lập Header để báo trình duyệt đây là file Excel
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${fileName}`
      );

      // Ghi workbook trực tiếp vào response (stream) thay vì lưu file trên server
      await workbook.xlsx.write(res);
      res.end();
      
      logger.info("Controller: Export Excel success");
    } catch (err) {
      logger.error("Controller Error: exportToExcel failed", err);
      res.status(500).json({ message: "Lỗi khi xuất file Excel: " + err.message });
    }
  },



  // API: /SanPhams/ThongKe/DanhMuc
  getCategoryStats: async (req, res) => {
    try {
      const stats = await SanPhamService.getCategoryReport();
      res.json(stats);
    } catch (err) {
      logger.error("Controller Error: getCategoryStats failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // API: /SanPhams/ThongKe/TongQuan
  getGeneralStats: async (req, res) => {
    try {
      const stats = await SanPhamService.getGeneralStats();
      res.json(stats);
    } catch (err) {
      logger.error("Controller Error: getGeneralStats failed", err);
      res.status(500).json({ message: err.message });
    }
  },
};
