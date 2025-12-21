import { DanhMucRepository } from "../repositories/danhmuc.repository.js";
import { DanhMucDTO } from "../dtos/danhmuc/danhmuc.dto.js";
import { logger } from "../config/logger.js";

export const DanhMucService = {
  getAllDanhMucs: async () => {
    logger.info("Service: Getting all DanhMucs");
    const danhMucs = await DanhMucRepository.getAll();
    return danhMucs.map((u) => new DanhMucDTO(u));
  },

  getDanhMucByMa: async (MaDM) => {
    logger.info(`Service: Getting DanhMuc by Ma ${MaDM}`);
    const danhMuc = await DanhMucRepository.getByMa(MaDM);

    if (!danhMuc) {
      logger.warn(`Service Warning: DanhMuc ${MaDM} not found`);
      throw new Error("DanhMuc not found");
    }

    return new DanhMucDTO(danhMuc);
  },
  // Tìm kiếm danh mục
  searchDanhMucs: async (ten) => {
    logger.info(`Service: Searching DanhMucs with keyword: ${ten}`);
    const results = await DanhMucRepository.searchByName(ten);
    return results.map((item) => new DanhMucDTO(item));
  },

  // Phân trang danh mục (10 dòng/trang)
  getDanhMucsByPage: async (page) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Pagination DanhMuc - Page ${page}`);
    const { danhMucs, totalItems } = await DanhMucRepository.getPaginated(offset, pageSize);

    return {
      data: danhMucs.map((item) => new DanhMucDTO(item)),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize: pageSize
      }
    };
  },
  createDanhMuc: async (dto) => {
    logger.info(`Service: Creating new DanhMuc ${dto.MaDM}`);
    const created = await DanhMucRepository.create(dto);
    return new DanhMucDTO(created);
  },

  updateDanhMuc: async (MaDM, dto) => {
    logger.info(`Service: Updating DanhMuc ${MaDM}`);

    const existing = await DanhMucRepository.getByMa(MaDM);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. DanhMuc ${MaDM} not found`);
      throw new Error("DanhMuc not found");
    }

    const updated = await DanhMucRepository.update(MaDM, dto);
    return new DanhMucDTO(updated);
  },

  deleteDanhMuc: async (MaDM) => {
    logger.info(`Service: Deleting DanhMuc ${MaDM}`);

    const existing = await DanhMucRepository.getByMa(MaDM);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. DanhMuc ${MaDM} not found`);
      throw new Error("DanhMuc not found");
    }

    await DanhMucRepository.delete(MaDM);
    return { message: "DanhMuc deleted successfully" };
  },
};