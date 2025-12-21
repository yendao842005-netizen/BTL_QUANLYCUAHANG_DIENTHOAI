import { HoaDonRepository } from "../repositories/hoadon.repository.js";
import { HoaDonDTO } from "../dtos/hoadon/hoadon.dto.js";
import { logger } from "../config/logger.js";

export const HoaDonService = {
  getAllHoaDons: async () => {
    logger.info("Service: Getting all HoaDons");
    const hoaDons = await HoaDonRepository.getAll();
    return hoaDons.map((u) => new HoaDonDTO(u));
  },

  getHoaDonByMa: async (MaHD) => {
    logger.info(`Service: Getting HoaDon by Ma ${MaHD}`);
    const hoaDon = await HoaDonRepository.getByMa(MaHD);

    if (!hoaDon) {
      logger.warn(`Service Warning: HoaDon ${MaHD} not found`);
      throw new Error("HoaDon not found");
    }

    return new HoaDonDTO(hoaDon);
  },

  // Phân trang
  getPaginatedInvoices: async (page) => {
    const pageSize = 10; //
    const offset = (page - 1) * pageSize; //
    const result = await HoaDonRepository.getPaginated(offset, pageSize);
    return {
      data: result.data,
      pagination: {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / pageSize), //
        currentPage: page
      }
    };
  },

  // Thống kê doanh thu
  getRevenueStats: async (year) => {
    const currentYear = year || new Date().getFullYear();
    return await HoaDonRepository.getMonthlyRevenue(currentYear);
  },

  filterInvoicesByDate: async (startDate, endDate) => {
    logger.info(`Service: Filtering invoices from ${startDate} to ${endDate}`);
    const invoices = await HoaDonRepository.filterByDate(startDate, endDate);
    
  
    return invoices; 
  },
  createHoaDon: async (dto) => {
    logger.info(`Service: Creating new HoaDon ${dto.MaHD}`);
    const created = await HoaDonRepository.create(dto);
    return new HoaDonDTO(created);
  },

  updateHoaDon: async (MaHD, dto) => {
    logger.info(`Service: Updating HoaDon ${MaHD}`);

    const existing = await HoaDonRepository.getByMa(MaHD);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. HoaDon ${MaHD} not found`);
      throw new Error("HoaDon not found");
    }

    const updated = await HoaDonRepository.update(MaHD, dto);
    return new HoaDonDTO(updated);
  },

  deleteHoaDon: async (MaHD) => {
    logger.info(`Service: Deleting HoaDon ${MaHD}`);

    const existing = await HoaDonRepository.getByMa(MaHD);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. HoaDon ${MaHD} not found`);
      throw new Error("HoaDon not found");
    }

    await HoaDonRepository.delete(MaHD);
    return { message: "HoaDon deleted successfully" };
  },
};