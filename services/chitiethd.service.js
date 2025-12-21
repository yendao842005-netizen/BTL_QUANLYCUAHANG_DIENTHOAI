import { ChiTietHoaDonRepository } from "../repositories/chitiethd.repository.js";
import { ChiTietHoaDonDTO } from "../dtos/chitiethd/chitiethd.dto.js";
import { logger } from "../config/logger.js";

export const ChiTietHoaDonService = {
  // Lấy chi tiết theo ID dòng (Primary Key)
  getChiTietById: async (ID) => {
    logger.info(`Service: Getting ChiTietHoaDon by ID ${ID}`);
    const item = await ChiTietHoaDonRepository.getById(ID);

    if (!item) {
      logger.warn(`Service Warning: ChiTietHoaDon ID ${ID} not found`);
      throw new Error("ChiTietHoaDon not found");
    }

    return new ChiTietHoaDonDTO(item);
  },
  
  // Lấy danh sách chi tiết của một hóa đơn
  getItemsByHoaDon: async (MaHD) => {
    logger.info(`Service: Getting items for HoaDon ${MaHD}`);
    const items = await ChiTietHoaDonRepository.getByMaHD(MaHD);
    return items.map((u) => new ChiTietHoaDonDTO(u));
  },

  createChiTiet: async (dto) => {
    logger.info(`Service: Creating new ChiTietHoaDon for HD ${dto.MaHD}`);
    const created = await ChiTietHoaDonRepository.create(dto);
    return new ChiTietHoaDonDTO(created);
  },

  updateChiTiet: async (ID, dto) => {
    logger.info(`Service: Updating ChiTietHoaDon ID ${ID}`);

    const existing = await ChiTietHoaDonRepository.getById(ID);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. ChiTietHoaDon ID ${ID} not found`);
      throw new Error("ChiTietHoaDon not found");
    }

    const updated = await ChiTietHoaDonRepository.update(ID, dto);
    return new ChiTietHoaDonDTO(updated);
  },

  deleteChiTiet: async (ID) => {
    logger.info(`Service: Deleting ChiTietHoaDon ID ${ID}`);

    const existing = await ChiTietHoaDonRepository.getById(ID);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. ChiTietHoaDon ID ${ID} not found`);
      throw new Error("ChiTietHoaDon not found");
    }

    await ChiTietHoaDonRepository.delete(ID);
    return { message: "ChiTietHoaDon deleted successfully" };
  },
};