import { HoaDonRepository } from "../repositories/hoadon.repository.js";
import { CartRepository } from "../repositories/cart.repository.js";
import { ChiTietHoaDonRepository } from "../repositories/chitiethd.repository.js";
import { KhachHangRepository } from "../repositories/khachhang.ropository.js";
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
    if (!hoaDon) throw new Error("HoaDon not found");
    return new HoaDonDTO(hoaDon);
  },

  getPaginatedInvoices: async (page, search, trangThai, phuongThuc) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    
    // Truyền thêm trangThai và phuongThuc xuống Repository
    const result = await HoaDonRepository.getPaginated(
      offset,
      pageSize,
      search,
      trangThai,
      phuongThuc
    );

    return {
      data: result.data, // Có thể map DTO nếu cần: result.data.map(x => new HoaDonDTO(x))
      pagination: {
        totalItems: result.total,
        totalPages: Math.ceil(result.total / pageSize),
        currentPage: page
      }
    };
  },

  getOrderCounts: async () => {
    return await HoaDonRepository.getOrderCounts();
  },

  getRevenueStats: async (year, month) => {
    const now = new Date();
    const y = year || now.getFullYear();
    if (month) {
      return await HoaDonRepository.getRevenueByMonthYear(month, y);
    }
    return await HoaDonRepository.getMonthlyRevenueByYear(y);
  },

  filterInvoicesByDate: async (startDate, endDate) => {
    logger.info(`Service: Filtering invoices from ${startDate} to ${endDate}`);
    return await HoaDonRepository.filterByDate(startDate, endDate);
  },

  getTopSellingStats: async (month, year) => {
    const today = new Date();
    const queryMonth = month ? parseInt(month) : today.getMonth() + 1;
    const queryYear = year ? parseInt(year) : today.getFullYear();

    const result = await HoaDonRepository.getTopSellingProducts(
      queryMonth,
      queryYear
    );
    return {
      time: { month: queryMonth, year: queryYear },
      data: result,
    };
  },

  // --- SỬA LOGIC TẠO HÓA ĐƠN ---
  createHoaDon: async (userId, dto) => {
    logger.info(`Service: Processing Order. UserID: ${userId}`);

    // TRƯỜNG HỢP 1: ADMIN TẠO ĐƠN (Có gửi MaKH và MaNV)
    if (dto.MaKH) {
      // Nếu Admin tạo, dto thường đã có đủ info, nhưng cần đảm bảo MaHD
      if (!dto.MaHD) {
        dto.MaHD = await HoaDonRepository.generateId();
      }
      const newInvoice = await HoaDonRepository.create(dto);
      return new HoaDonDTO(newInvoice);
    }

    // TRƯỜNG HỢP 2: KHÁCH HÀNG MUA ONLINE (dto chưa có MaKH)

    // 1. Kiểm tra giỏ hàng
    const cartItems = await CartRepository.getCartByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Giỏ hàng trống, không thể tạo đơn hàng!");
    }

    // 2. Tìm hồ sơ khách hàng
    let currentCustomer = await KhachHangRepository.getByAccount(userId);
    if (!currentCustomer) {
      throw new Error(
        "Lỗi dữ liệu: Tài khoản chưa liên kết thông tin khách hàng."
      );
    }

    // 3. Cập nhật thông tin khách (nếu form gửi lên có thay đổi)
    const updateData = {};
    if (!currentCustomer.DiaChi && dto.DiaChiGiaoHang)
      updateData.DiaChi = dto.DiaChiGiaoHang;
    // Kiểm tra kỹ hơn để tránh update null vào DB
    if (dto.NgaySinh) updateData.NgaySinh = dto.NgaySinh;
    if (dto.GioiTinh) updateData.GioiTinh = dto.GioiTinh;

    if (Object.keys(updateData).length > 0) {
      await KhachHangRepository.update(currentCustomer.MaKH, {
        ...currentCustomer,
        ...updateData,
      });
      currentCustomer = { ...currentCustomer, ...updateData };
    }

    // 4. Tính toán Tổng Tiền từ Giỏ hàng (Bảo mật)
    let calculatedTotal = 0;
    cartItems.forEach((item) => {
      calculatedTotal += item.GiaBan * item.SoLuong;
    });

    // 5. [QUAN TRỌNG] Tạo object dữ liệu Hóa Đơn đầy đủ
    // Sinh mã tự động
    const newMaHD = await HoaDonRepository.generateId();

    const orderData = {
      MaHD: newMaHD,
      MaKH: currentCustomer.MaKH,
      MaNV: null, // Khách mua online ko có nhân viên
      NgayLap: new Date(), // Thời gian hiện tại
      TongTien: calculatedTotal,
      TrangThai: "ChoXuLy",
      // Lấy phương thức thanh toán từ DTO gửi lên, mặc định là Tiền mặt
      PhuongThucThanhToan: dto.PhuongThucThanhToan || "TienMat",
      GhiChu: dto.GhiChu || "Đặt hàng trực tuyến",
    };

    // 6. Lưu Hóa Đơn
    const newInvoice = await HoaDonRepository.create(orderData);

    // 7. Lưu Chi Tiết
    for (const item of cartItems) {
      await ChiTietHoaDonRepository.create({
        MaHD: newMaHD,
        MaSP: item.MaSP,
        SoLuong: item.SoLuong,
        DonGia: item.GiaBan,
      });
    }

    // 8. Xóa giỏ hàng
    await CartRepository.clearCart(userId);

    // Trả về DTO
    return new HoaDonDTO(newInvoice);
  },

  updateHoaDon: async (MaHD, dto) => {
    const existing = await HoaDonRepository.getByMa(MaHD);
    if (!existing) throw new Error("HoaDon not found");

    const updated = await HoaDonRepository.update(MaHD, dto);
    return new HoaDonDTO(updated);
  },

  deleteHoaDon: async (MaHD) => {
    const existing = await HoaDonRepository.getByMa(MaHD);
    if (!existing) throw new Error("HoaDon not found");

    await HoaDonRepository.delete(MaHD);
    return { message: "HoaDon deleted successfully" };
  },
};
