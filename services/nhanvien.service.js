import { NhanVienRepository } from "../repositories/nhanvien.repository.js";
import { NhanVienDTO } from "../dtos/nhanvien/nhanvien.dto.js"; // Giả sử file dto tên này
import { logger } from "../config/logger.js";

export const NhanVienService = {
  getAllNhanViens: async () => {
    logger.info("Service: Getting all NhanViens");
    const nhanViens = await NhanVienRepository.getAll();
    return nhanViens.map((u) => new NhanVienDTO(u));
  },

  getNhanVienByMa: async (MaNV) => {
    logger.info(`Service: Getting NhanVien by Ma ${MaNV}`);
    const nhanVien = await NhanVienRepository.getByMa(MaNV);

    if (!nhanVien) {
      logger.warn(`Service Warning: NhanVien ${MaNV} not found`);
      throw new Error("NhanVien not found");
    }

    return new NhanVienDTO(nhanVien);
  },

  searchNhanViens: async (filters) => {
    logger.info("Service: Searching NhanViens with filters");
    const nhanViens = await NhanVienRepository.searchAdvanced(filters);
    return nhanViens.map((u) => new NhanVienDTO(u));
  },

  getNhanViensByPage: async (page) => {
    const pageSize = 10; // Quy định 10 dòng mỗi trang
    const offset = (page - 1) * pageSize; // Tính vị trí bắt đầu

    logger.info(`Service: Pagination NhanVien - Page ${page}`);
    
    const { nhanViens, totalItems } = await NhanVienRepository.getPaginated(offset, pageSize);

    return {
      data: nhanViens.map((u) => new NhanVienDTO(u)), 
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize), 
        currentPage: page,
        pageSize: pageSize
      }
    };
  },

  createNhanVien: async (dto) => {
    logger.info(`Service: Creating new NhanVien ${dto.MaNV}`);
    const created = await NhanVienRepository.create(dto);
    return new NhanVienDTO(created);
  },

  updateNhanVien: async (MaNV, dto) => {
    logger.info(`Service: Updating NhanVien ${MaNV}`);

    const existing = await NhanVienRepository.getByMa(MaNV);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. NhanVien ${MaNV} not found`);
      throw new Error("NhanVien not found");
    }

    const updated = await NhanVienRepository.update(MaNV, dto);
    return new NhanVienDTO(updated);
  },

  deleteNhanVien: async (MaNV) => {
    logger.info(`Service: Deleting NhanVien ${MaNV}`);

    const existing = await NhanVienRepository.getByMa(MaNV);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. NhanVien ${MaNV} not found`);
      throw new Error("NhanVien not found");
    }

    await NhanVienRepository.delete(MaNV);
    return { message: "NhanVien deleted successfully" };
  },
};