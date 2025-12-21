import { CreateChiTietHoaDonDTO} from "../dtos/chitiethd/create-chitiethd.dto.js";
import { UpdateChiTietHoaDonDTO } from "../dtos/chitiethd/update-chitiethd.dto.js";

import { ChiTietHoaDonService } from "../services/chitiethd.service.js";
import { validateCreateChiTietHoaDon} from "../validators/chitiethoadon/create-chitiethd.validator.js";
import { validateUpdateChiTietHoaDon } from "../validators/chitiethoadon/update-chitiethd.validator.js";

import { logger } from "../config/logger.js";

export const ChiTietHoaDonController = {
  // Lấy chi tiết theo ID (Số) -> Giữ nguyên dấu +
  getById: async (req, res) => {
    const ID = +req.params.ID;
    logger.info(`Controller: GET /ChiTietHoaDons/${ID}`);

    try {
      const item = await ChiTietHoaDonService.getChiTietById(ID);
      res.json(item);
    } catch (err) {
      logger.error(`Controller Error: getById failed (${ID})`, err);
      res.status(404).json({ message: err.message });
    }
  },

  // Lấy chi tiết theo Mã Hóa Đơn
  getByHoaDon: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: GET /ChiTietHoaDons/HoaDon/${MaHD}`);

    try {
      const items = await ChiTietHoaDonService.getItemsByHoaDon(MaHD);
      res.json(items);
    } catch (err) {
      logger.error(`Controller Error: getByHoaDon failed (${MaHD})`, err);
      res.status(404).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      logger.info("Controller: POST /ChiTietHoaDons");
      const validatedData = validateCreateChiTietHoaDon(req.body);
      const dto = new CreateChiTietHoaDonDTO(validatedData);
      const item = await ChiTietHoaDonService.createChiTiet(dto);
      res.status(201).json(item);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const ID = +req.params.ID; // ID là số
    logger.info(`Controller: PUT /ChiTietHoaDons/${ID}`);
    try {
      const validatedData = validateUpdateChiTietHoaDon(req.body);
      const dto = new UpdateChiTietHoaDonDTO(validatedData);
      const item = await ChiTietHoaDonService.updateChiTiet(ID, dto);
      res.json(item);
    } catch (err) {
      logger.error(`Controller Error: update failed (${ID})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const ID = +req.params.ID; // ID là số
    logger.info(`Controller: DELETE /ChiTietHoaDons/${ID}`);
    try {
      const result = await ChiTietHoaDonService.deleteChiTiet(ID);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${ID})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};