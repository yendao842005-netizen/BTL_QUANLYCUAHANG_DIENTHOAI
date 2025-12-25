import { CreateKhachHangDTO } from "../dtos/khachhang/create-khachhang.dto.js";
import { UpdateKhachHangDTO } from "../dtos/khachhang/update-khachhang.dto.js";

import { KhachHangService } from "../services/khachhang.service.js";
import { validateCreateKhachHang } from "../validators/khachhang/create-khachhang.validator.js";
import { validateUpdateKhachHang } from "../validators/khachhang/update-validator.js";

import { logger } from "../config/logger.js";

export const KhachHangController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /KhachHangs");
      const KhachHangs = await KhachHangService.getAllKhachHangs();
      res.json(KhachHangs);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaKH = req.params.MaKH;
    logger.info(`Controller: GET /KhachHangs/${MaKH}`);

    try {
      const KhachHang = await KhachHangService.getKhachHangByMa(MaKH);
      res.json(KhachHang);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaKH})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  // API Phân trang
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      logger.info(`Controller: GET /KhachHangs/PhanTrang?page=${page}`);
      const result = await KhachHangService.getKhachHangsByPage(page);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPaginated KhachHang failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // API Tìm kiếm
  search: async (req, res) => {
    try {
      logger.info("Controller: GET /KhachHangs/Search");
      const filters = {
        hoTen: req.query.hoTen,
        soDienThoai: req.query.soDienThoai,
        diaChi: req.query.diaChi,
        email: req.query.email
      };
      const results = await KhachHangService.searchKhachHangs(filters);
      res.json(results);
    } catch (err) {
      logger.error("Controller Error: search KhachHang failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      logger.info("Controller: POST /KhachHangs");
      const validatedData = validateCreateKhachHang(req.body);
      const dto = new CreateKhachHangDTO(validatedData);
      const KhachHang = await KhachHangService.createKhachHang(dto);
      res.status(201).json(KhachHang);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaKH = req.params.MaKH;
    logger.info(`Controller: PUT /KhachHangs/${MaKH}`);
    try {
      const validatedData = validateUpdateKhachHang(req.body);
      const dto = new UpdateKhachHangDTO(validatedData);
      const KhachHang = await KhachHangService.updateKhachHang(MaKH, dto);
      res.json(KhachHang);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaKH})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaKH = req.params.MaKH;
    logger.info(`Controller: DELETE /KhachHangs/${MaKH}`);
    try {
      const result = await KhachHangService.deleteKhachHang(MaKH);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaKH})`, err);
      res.status(404).json({ message: err.message });
    }
  },



  // API: /KhachHangs/VipStats
  getVipStats: async (req, res) => {
    try {
      const result = await KhachHangService.getVipCustomers();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  
  // API: /KhachHangs/:MaKH/DonHang
  getOrders: async (req, res) => {
    try {
      const { MaKH } = req.params;
      const result = await KhachHangService.getCustomerOrderHistory(MaKH);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },


  // Xuất Excel toàn bộ khách hàng
  exportToExcel: async (req, res) => {
    try {
      const workbook = await KhachHangService.generateExcel();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=KhachHang_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },


  // API: /KhachHangs/:MaKH/Export/Excel
  exportCustomerInvoices: async (req, res) => {
    try {
      const { MaKH } = req.params;
      const workbook = await KhachHangService.generateInvoiceExcelForCustomer(MaKH);

      // Đặt tên file: LichSuMuaHang_KH001.xlsx
      const fileName = `LichSuMuaHang_${MaKH}_${Date.now()}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${fileName}`
      );

      await workbook.xlsx.write(res);
      res.end();
      
      logger.info(`Controller: Export Customer ${MaKH} success`);
    } catch (err) {
      logger.error("Controller Error: exportCustomerInvoices failed", err);
      // Nếu lỗi do không có data (như service ném ra), trả về 404 hoặc 400
      if (err.message.includes("chưa có đơn hàng")) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: "Lỗi hệ thống: " + err.message });
    }
  }
};