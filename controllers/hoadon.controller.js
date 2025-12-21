import { CreateHoaDonDTO } from "../dtos/hoadon/create-hoadon.js";
import { UpdateHoaDonDTO } from "../dtos/hoadon/update-hoadon.dto.js";

import { HoaDonService } from "../services/hoadon.service.js";
import { validateCreateHoaDon } from "../validators/hoadon/create-hoadon.validator.js";
import { validateUpdateHoaDon } from "../validators/hoadon/update-hoadon.validator.js";

import { logger } from "../config/logger.js";

export const HoaDonController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /HoaDons");
      const HoaDons = await HoaDonService.getAllHoaDons();
      res.json(HoaDons);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: GET /HoaDons/${MaHD}`);

    try {
      const HoaDon = await HoaDonService.getHoaDonByMa(MaHD);
      res.json(HoaDon);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaHD})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  // API Phân trang
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const result = await HoaDonService.getPaginatedInvoices(page);
      res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
  },

  // API Thống kê doanh thu theo năm
  getStats: async (req, res) => {
    try {
      const year = req.query.year;
      const stats = await HoaDonService.getRevenueStats(year);
      res.json(stats);
    } catch (err) { res.status(500).json({ message: err.message }); }
  },

  // Hàm mới: Xử lý yêu cầu lọc theo ngày từ API
  getByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.query; // Lấy từ ?startDate=...&endDate=...
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc" });
      }

      logger.info(`Controller: GET /HoaDons/LocTheoNgay?startDate=${startDate}&endDate=${endDate}`);
      
      const result = await HoaDonService.filterInvoicesByDate(startDate, endDate);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getByDate failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      logger.info("Controller: POST /HoaDons");
      const validatedData = validateCreateHoaDon(req.body);
      const dto = new CreateHoaDonDTO(validatedData);
      const HoaDon = await HoaDonService.createHoaDon(dto);
      res.status(201).json(HoaDon);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: PUT /HoaDons/${MaHD}`);
    try {
      const validatedData = validateUpdateHoaDon(req.body);
      const dto = new UpdateHoaDonDTO(validatedData);
      const HoaDon = await HoaDonService.updateHoaDon(MaHD, dto);
      res.json(HoaDon);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaHD})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: DELETE /HoaDons/${MaHD}`);
    try {
      const result = await HoaDonService.deleteHoaDon(MaHD);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaHD})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};