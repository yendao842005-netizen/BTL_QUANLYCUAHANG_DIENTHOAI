import { NhaCungCapRepository } from "../repositories/ncc.repository.js";
import { NhaCungCapDTO } from "../dtos/nhacungcap/ncc.dto.js";
import { logger } from "../config/logger.js";

export const NhaCungCapService = {
  getAllNhaCungCaps: async () => {
    logger.info("Service: Getting all NhaCungCaps");
    const nhaCungCaps = await NhaCungCapRepository.getAll();
    return nhaCungCaps.map((u) => new NhaCungCapDTO(u));
  },

  getNhaCungCapByMa: async (MaNCC) => {
    logger.info(`Service: Getting NhaCungCap by Ma ${MaNCC}`);
    const nhaCungCap = await NhaCungCapRepository.getByMa(MaNCC);

    if (!nhaCungCap) {
      logger.warn(`Service Warning: NhaCungCap ${MaNCC} not found`);
      throw new Error("NhaCungCap not found");
    }

    return new NhaCungCapDTO(nhaCungCap);
  },
  // Tìm kiếm nâng cao
  searchNhaCungCaps: async (filters) => {
    logger.info("Service: Searching NhaCungCaps with filters");
    const results = await NhaCungCapRepository.searchAdvanced(filters);
    return results.map((item) => new NhaCungCapDTO(item));
  },

  // Phân trang (10 dòng/trang)
  getNhaCungCapsByPage: async (page) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Pagination NhaCungCap - Page ${page}`);
    const { nhaCungCaps, totalItems } = await NhaCungCapRepository.getPaginated(offset, pageSize);

    return {
      data: nhaCungCaps.map((item) => new NhaCungCapDTO(item)),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize: pageSize
      }
    };
  },
  
  createNhaCungCap: async (dto) => {
    logger.info(`Service: Creating new NhaCungCap ${dto.MaNCC}`);
    const created = await NhaCungCapRepository.create(dto);
    return new NhaCungCapDTO(created);
  },

  updateNhaCungCap: async (MaNCC, dto) => {
    logger.info(`Service: Updating NhaCungCap ${MaNCC}`);

    const existing = await NhaCungCapRepository.getByMa(MaNCC);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. NhaCungCap ${MaNCC} not found`);
      throw new Error("NhaCungCap not found");
    }

    const updated = await NhaCungCapRepository.update(MaNCC, dto);
    return new NhaCungCapDTO(updated);
  },

  deleteNhaCungCap: async (MaNCC) => {
    logger.info(`Service: Deleting NhaCungCap ${MaNCC}`);

    const existing = await NhaCungCapRepository.getByMa(MaNCC);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. NhaCungCap ${MaNCC} not found`);
      throw new Error("NhaCungCap not found");
    }

    await NhaCungCapRepository.delete(MaNCC);
    return { message: "NhaCungCap deleted successfully" };
  },
};