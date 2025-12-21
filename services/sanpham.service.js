import { SanPhamRepository } from "../repositories/sanpham.repository.js";
import { SanPhamDTO } from "../dtos/sanpham/sanpham.dto.js";
import { logger } from "../config/logger.js";

export const SanPhamService = {
  getAllSanPhams: async () => {
    logger.info("Service: Getting all SanPhams");
    const SanPhams = await SanPhamRepository.getAll();
    return SanPhams.map((u) => new SanPhamDTO(u));
  },

  getSanPhamByMa: async (MaSP) => {
    logger.info(`Service: Getting SanPham by Ma ${MaSP}`);
    const SanPham = await SanPhamRepository.getByMa(MaSP);

    if (!SanPham) {
      logger.warn(`Service Warning: SanPham ${MaSP} not found`);
      throw new Error("SanPham not found");
    }

    return new SanPhamDTO(SanPham);
  },

    // Xử lý danh sách phân trang và sắp xếp
  getPaginatedList: async (page, sortBy, order) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // Gọi repo với các tham số sắp xếp (nếu không có sẽ dùng mặc định ở repo)
    const { products, totalItems } = await SanPhamRepository.getPaginated(offset, pageSize, sortBy, order);

    return {
      data: products.map(p => new SanPhamDTO(p)),
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page
      }
    };
  },
  
  searchAdvancedProducts: async (filters, page) => {
    const pageSize = 10; // 10 dòng mỗi trang
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Advanced search - Page ${page}`);
    
    const { products, totalItems } = await SanPhamRepository.searchAdvanced({
      ...filters,
      offset,
      limit: pageSize
    });

    return {
      data: products.map((item) => new SanPhamDTO(item)),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page
      }
    };
  },

  createSanPham: async (dto) => {
    logger.info(`Service: Creating new SanPham ${dto.MaSP}`);
    const created = await SanPhamRepository.create(dto);
    return new SanPhamDTO(created);
  },

  updateSanPham: async (MaSP, dto) => {
    logger.info(`Service: Updating SanPham ${MaSP}`);

    const existing = await SanPhamRepository.getByMa(MaSP);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. SanPham ${MaSP} not found`);
      throw new Error("SanPham not found");
    }

    const updated = await SanPhamRepository.update(MaSP, dto);
    return new SanPhamDTO(updated);
  },

  deleteSanPham: async (MaSP) => {
    logger.info(`Service: Deleting SanPham ${MaSP}`);

    const existing = await SanPhamRepository.getByMa(MaSP);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. SanPham ${MaSP} not found`);
      throw new Error("SanPham not found");
    }

    await SanPhamRepository.delete(MaSP);
    return { message: "SanPham deleted successfully" };
  },
};
