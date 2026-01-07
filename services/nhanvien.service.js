import { NhanVienRepository } from "../repositories/nhanvien.repository.js";
import { NhanVienDTO } from "../dtos/nhanvien/nhanvien.dto.js"; // Giả sử file dto tên này
import { logger } from "../config/logger.js";
import ExcelJS from "exceljs";
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

  // THỐNG KÊ HIỆU SUẤT NHÂN VIÊN theo thời gian nhập vào 
  analyzePerformance: async (startDate, endDate) => {
    // 1. Xử lý logic ngày tháng mặc định (Nếu user không gửi lên)
    // Mặc định lấy ngày đầu tháng này đến hiện tại
    const today = new Date();
    
    let start = startDate;
    let end = endDate;

    if (!start) {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }

    if (!end) {
      // Để đảm bảo lấy hết ngày hôm nay, ta nên set time là cuối ngày hoặc đơn giản lấy ngày mai
      // Ở đây lấy string YYYY-MM-DD
      end = today.toISOString().split('T')[0];
    }
    
    // Nếu endDate người dùng gửi lên dạng '2024-12-31', để lấy trọn vẹn ngày đó ta nên thêm giờ vào SQL
    // Cách đơn giản nhất cho string là nối thêm giờ cuối ngày
    const formattedEnd = end.includes(':') ? end : `${end} 23:59:59`;
    const formattedStart = start.includes(':') ? start : `${start} 00:00:00`;

    logger.info(`Service: Analyzing Performance ${formattedStart} -> ${formattedEnd}`);

    const stats = await NhanVienRepository.getPerformanceStats(formattedStart, formattedEnd);

    // 2. Tính toán thêm (Ranking)
    const totalRevenueAll = stats.reduce((sum, item) => sum + Number(item.TongDoanhThu), 0);

    return {
      period: { from: start, to: end },
      totalRevenueAllEmployees: totalRevenueAll,// Tổng doanh thu tất cả nhân viên(cửa hàng)
      data: stats.map(nv => ({
        ...nv,
        TyLeDongGop: totalRevenueAll > 0 
          ? ((Number(nv.TongDoanhThu) / totalRevenueAll) * 100).toFixed(2) + '%' 
          : '0%'
      }))
    };
  },

  //xuất excel
  generateExcel: async () => {
    const employees = await NhanVienRepository.getAllForExport();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh Sách Nhân Viên");

    worksheet.columns = [
      { header: "Mã NV", key: "MaNV", width: 10 },
      { header: "Họ Tên", key: "HoTen", width: 25 },
      { header: "Ngày Sinh", key: "NgaySinh", width: 15 },
      { header: "Giới Tính", key: "GioiTinh", width: 10 },
      { header: "SĐT", key: "SoDienThoai", width: 15 },
      { header: "Email", key: "Email", width: 25 },
      { header: "Chức Vụ", key: "ChucVu", width: 15 },
      { header: "Lương CB", key: "LuongCoBan", width: 15 },
      { header: "Ngày Vào", key: "NgayVaoLam", width: 15 },
    ];
    
    // Format Header đậm
    worksheet.getRow(1).font = { bold: true };

    employees.forEach(emp => {
      worksheet.addRow({
        ...emp,
        NgaySinh: emp.NgaySinh ? new Date(emp.NgaySinh).toLocaleDateString("vi-VN") : "",
        NgayVaoLam: emp.NgayVaoLam ? new Date(emp.NgayVaoLam).toLocaleDateString("vi-VN") : ""
      });
    });

    return workbook;
  },

  getDashboardStats: async () => {
    logger.info("Service: Getting dashboard stats");
    const stats = await NhanVienRepository.getDashboardStats();

    // Tính % Hiệu suất
    let avgPerformance = 0;
    if (stats.ordersTotal > 0) {
      avgPerformance = (stats.ordersCompleted / stats.ordersTotal) * 100;
    }

 
    return {
      TongNhanVien: Number(stats.totalEmployees || 0),
      TongLuong: Number(stats.totalSalary || 0),    // Ép về số để frontend chia không bị NaN
      DoanhSoThang: Number(stats.monthSales || 0),  // Ép về số
      HieuSuatTrungBinh: avgPerformance.toFixed(1)
    };
  },

  getTopEmployeesByRevenue: async (limit) => {
    // Mặc định lấy top 5 nếu không truyền limit
    const topLimit = limit ? parseInt(limit) : 5;
    
    const result = await NhanVienRepository.getTopRevenue(topLimit);
    
    // Trả về dữ liệu, ép kiểu số cho chắc chắn
    return result.map(emp => ({
        MaNV: emp.MaNV,
        HoTen: emp.HoTen,
        ChucVu: emp.ChucVu,
        SoDonHang: Number(emp.SoDonHang),
        TongDoanhThu: Number(emp.TongDoanhThu)
    }));
  },
};