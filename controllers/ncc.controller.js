import { CreateNhaCungCapDTO } from "../dtos/nhacungcap/create-ncc.dto.js";
import { UpdateNhaCungCapDTO } from "../dtos/nhacungcap/update-ncc.dto.js";

import { NhaCungCapService } from "../services/ncc.service.js";
import { validateCreateNhaCungCap } from "../validators/nhacungcap/create-ncc.validator.js";
import { validateUpdateNhaCungCap } from "../validators/nhacungcap/update-ncc.validator.js";

import { logger } from "../config/logger.js";

export const NhaCungCapController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /NhaCungCaps");
      const NhaCungCaps = await NhaCungCapService.getAllNhaCungCaps();
      res.json(NhaCungCaps);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaNCC = req.params.MaNCC;
    logger.info(`Controller: GET /NhaCungCaps/${MaNCC}`);

    try {
      const NhaCungCap = await NhaCungCapService.getNhaCungCapByMa(MaNCC);
      res.json(NhaCungCap);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaNCC})`, err);
      res.status(404).json({ message: err.message });
    }
  },
// API Phân trang
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      logger.info(`Controller: GET /NhaCungCaps/PhanTrang?page=${page}`);
      const result = await NhaCungCapService.getNhaCungCapsByPage(page);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPaginated failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // API Tìm kiếm
  search: async (req, res) => {
    try {
      logger.info("Controller: GET /NhaCungCaps/Search");
      const filters = {
        ten: req.query.ten,
        nguoiLienHe: req.query.nguoiLienHe,
        diaChi: req.query.diaChi
      };
      const results = await NhaCungCapService.searchNhaCungCaps(filters);
      res.json(results);
    } catch (err) {
      logger.error("Controller Error: search failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      logger.info("Controller: POST /NhaCungCaps");
      const validatedData = validateCreateNhaCungCap(req.body);
      const dto = new CreateNhaCungCapDTO(validatedData);
      const NhaCungCap = await NhaCungCapService.createNhaCungCap(dto);
      res.status(201).json(NhaCungCap);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaNCC = req.params.MaNCC;
    logger.info(`Controller: PUT /NhaCungCaps/${MaNCC}`);
    try {
      const validatedData = validateUpdateNhaCungCap(req.body);
      const dto = new UpdateNhaCungCapDTO(validatedData);
      const NhaCungCap = await NhaCungCapService.updateNhaCungCap(MaNCC, dto);
      res.json(NhaCungCap);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaNCC})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaNCC = req.params.MaNCC;
    logger.info(`Controller: DELETE /NhaCungCaps/${MaNCC}`);
    try {
      const result = await NhaCungCapService.deleteNhaCungCap(MaNCC);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaNCC})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};