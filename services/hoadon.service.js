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
  
  getPaginatedInvoices: async (page, search) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    // Gọi repo với tham số search
    const result = await HoaDonRepository.getPaginated(offset, pageSize, search);
    return {
      data: result.data,
      pagination: {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / pageSize),
        currentPage: page
      }
    };
  },

  // ---  Lấy thống kê số lượng đơn ---
  getOrderCounts: async () => {
    return await HoaDonRepository.getOrderCounts();
  },

  // Thống kê doanh thu
  // getRevenueStats: async (year) => {
  //   const currentYear = year || new Date().getFullYear();
  //   return await HoaDonRepository.getMonthlyRevenue(currentYear);
  // },

  // Thống kê doanh thu (theo năm hoặc theo tháng+năm)
getRevenueStats: async (year, month) => {
  const now = new Date();
  const y = year || now.getFullYear();

  // 👉 Nếu có nhập tháng → thống kê theo tháng + năm
  if (month) {
    return await HoaDonRepository.getRevenueByMonthYear(month, y);
  }

  // 👉 Nếu chỉ nhập năm (hoặc không nhập gì)
  return await HoaDonRepository.getMonthlyRevenueByYear(y);
},


  filterInvoicesByDate: async (startDate, endDate) => {
    logger.info(`Service: Filtering invoices from ${startDate} to ${endDate}`);
    const invoices = await HoaDonRepository.filterByDate(startDate, endDate);
    
  
    return invoices; 
  },

// Hàm xử lý logic cho Top Bán Chạy
  getTopSellingStats: async (month, year) => {
    // 1. Logic mặc định: Nếu không truyền, lấy thời gian hiện tại
    const today = new Date();
    
    // Nếu month không có, lấy tháng hiện tại (JS getMonth chạy từ 0-11 nên phải +1)
    const queryMonth = month ? parseInt(month) : (today.getMonth() + 1);
    
    // Nếu year không có, lấy năm hiện tại
    const queryYear = year ? parseInt(year) : today.getFullYear();

    logger.info(`Service: Getting Top Selling Products for ${queryMonth}/${queryYear}`);

    // 2. Gọi Repository
    const result = await HoaDonRepository.getTopSellingProducts(queryMonth, queryYear);
    
    // 3. Trả về kèm thông tin thời gian để Frontend dễ hiển thị tiêu đề
    return {
      time: { month: queryMonth, year: queryYear },
      data: result
    };
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