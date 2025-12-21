import { CreateDanhMucDTO} from "../dtos/danhmuc/create-danhmuc.dto.js";
import { UpdateDanhMucDTO } from "../dtos/danhmuc/update-danhmuc.dto.js";
import { DanhMucService } from "../services/danhmuc.service.js";
import { validateCreateDanhMuc } from "../validators/danhmuc/create-danhmuc.validator.js";
import { validateUpdateDanhMuc } from "../validators/danhmuc/update-danhmuc.validator.js";

import { logger } from "../config/logger.js";

export const DanhMucController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /DanhMucs");
      const DanhMucs = await DanhMucService.getAllDanhMucs();
      res.json(DanhMucs);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaDM = req.params.MaDM;
    logger.info(`Controller: GET /DanhMucs/${MaDM}`);

    try {
      const DanhMuc = await DanhMucService.getDanhMucByMa(MaDM);
      res.json(DanhMuc);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaDM})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  // API Phân trang
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      logger.info(`Controller: GET /DanhMucs/PhanTrang?page=${page}`);
      const result = await DanhMucService.getDanhMucsByPage(page);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPaginated failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // API Tìm kiếm
  search: async (req, res) => {
    try {
      const ten = req.query.ten || "";
      logger.info(`Controller: GET /DanhMucs/Search?ten=${ten}`);
      const results = await DanhMucService.searchDanhMucs(ten);
      res.json(results);
    } catch (err) {
      logger.error("Controller Error: search failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  create: async (req, res) => {
    try {
      logger.info("Controller: POST /DanhMucs");
      const validatedData = validateCreateDanhMuc(req.body);
      const dto = new CreateDanhMucDTO(validatedData);
      const DanhMuc = await DanhMucService.createDanhMuc(dto);
      res.status(201).json(DanhMuc);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaDM = req.params.MaDM;
    logger.info(`Controller: PUT /DanhMucs/${MaDM}`);
    try {
      const validatedData = validateUpdateDanhMuc(req.body);
      const dto = new UpdateDanhMucDTO(validatedData);
      const DanhMuc = await DanhMucService.updateDanhMuc(MaDM, dto);
      res.json(DanhMuc);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaDM})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaDM = req.params.MaDM;
    logger.info(`Controller: DELETE /DanhMucs/${MaDM}`);
    try {
      const result = await DanhMucService.deleteDanhMuc(MaDM);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaDM})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};