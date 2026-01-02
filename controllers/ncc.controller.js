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
  // Sửa lại hàm search
  search: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Lấy page từ query
      logger.info(`Controller: GET /NhaCungCaps/Search page=${page}`);
      
      const filters = {
        ten: req.query.ten, // Tương ứng với keyword tìm kiếm
        nguoiLienHe: req.query.nguoiLienHe,
        diaChi: req.query.diaChi
      };
      
      const results = await NhaCungCapService.searchNhaCungCaps(filters, page);
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

  
  //  Lấy danh sách sản phẩm thuộc về NCC này
  // API: /NhaCungCaps/BaoCao/SanPham?MaNCC=...
  getSupplierReport: async (req, res) => {
    try {
      const { MaNCC } = req.query; // Lấy từ URL query string

      if (!MaNCC) {
        return res.status(400).json({ message: "Vui lòng cung cấp MaNCC" });
      }

      const result = await NhaCungCapService.getSupplierReport(MaNCC);
      res.json(result);

    } catch (err) {
      logger.error("Controller Error: getSupplierReport failed", err);
      
      if (err.message.includes("không tồn tại")) {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: err.message });
    }
  },

  //xuất excel
  exportToExcel: async (req, res) => {
    try {
      const workbook = await NhaCungCapService.generateExcel();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=NhaCungCap_${Date.now()}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) { res.status(500).json({ message: err.message }); }
  },
  // URL gọi: GET /api/NhaCungCaps/ThongKe/TongQuan
  getGeneralStats: async (req, res) => {
    try {
      logger.info("Controller: GET /NhaCungCaps/ThongKe/TongQuan");
      
      const result = await NhaCungCapService.getThongKeTongQuan();
      
      // Kết quả trả về sẽ có dạng:
      // {
      //   "TongNhaCungCap": 10,
      //   "TongSanPham": 150,
   
      // }
      res.status(200).json(result);
    } catch (err) {
      logger.error("Controller Error: getGeneralStats failed", err);
      res.status(500).json({ message: "Lỗi lấy dữ liệu thống kê" });
    }
  },
};