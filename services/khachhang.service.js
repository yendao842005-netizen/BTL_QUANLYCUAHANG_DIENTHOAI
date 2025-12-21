import { KhachHangRepository } from "../repositories/khachhang.ropository.js";
import { KhachHangDTO } from "../dtos/khachhang/khachhang.dto.js";
import { logger } from "../config/logger.js";

export const KhachHangService = {
  getAllKhachHangs: async () => {
    logger.info("Service: Getting all KhachHangs");
    const khachHangs = await KhachHangRepository.getAll();
    return khachHangs.map((u) => new KhachHangDTO(u));
  },

  getKhachHangByMa: async (MaKH) => {
    logger.info(`Service: Getting KhachHang by Ma ${MaKH}`);
    const khachHang = await KhachHangRepository.getByMa(MaKH);

    if (!khachHang) {
      logger.warn(`Service Warning: KhachHang ${MaKH} not found`);
      throw new Error("KhachHang not found");
    }

    return new KhachHangDTO(khachHang);
  },
  // Tìm kiếm khách hàng
  searchKhachHangs: async (filters) => {
    logger.info("Service: Searching KhachHangs with filters");
    const results = await KhachHangRepository.searchAdvanced(filters);
    return results.map((item) => new KhachHangDTO(item));
  },

  // Phân trang (10 khách hàng mỗi trang)
  getKhachHangsByPage: async (page) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Pagination KhachHang - Page ${page}`);
    const { khachHangs, totalItems } = await KhachHangRepository.getPaginated(offset, pageSize);

    return {
      data: khachHangs.map((item) => new KhachHangDTO(item)),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize: pageSize
      }
    };
  },
  createKhachHang: async (dto) => {
    logger.info(`Service: Creating new KhachHang ${dto.MaKH}`);
    const created = await KhachHangRepository.create(dto);
    return new KhachHangDTO(created);
  },

  updateKhachHang: async (MaKH, dto) => {
    logger.info(`Service: Updating KhachHang ${MaKH}`);

    const existing = await KhachHangRepository.getByMa(MaKH);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. KhachHang ${MaKH} not found`);
      throw new Error("KhachHang not found");
    }

    const updated = await KhachHangRepository.update(MaKH, dto);
    return new KhachHangDTO(updated);
  },

  deleteKhachHang: async (MaKH) => {
    logger.info(`Service: Deleting KhachHang ${MaKH}`);

    const existing = await KhachHangRepository.getByMa(MaKH);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. KhachHang ${MaKH} not found`);
      throw new Error("KhachHang not found");
    }

    await KhachHangRepository.delete(MaKH);
    return { message: "KhachHang deleted successfully" };
  },
};