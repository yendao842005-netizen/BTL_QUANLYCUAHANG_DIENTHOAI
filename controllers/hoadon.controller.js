import { CreateHoaDonDTO } from "../dtos/hoadon/create-hoadon.js";
import { UpdateHoaDonDTO } from "../dtos/hoadon/update-hoadon.dto.js";

import { HoaDonService } from "../services/hoadon.service.js";
import { validateCreateHoaDon } from "../validators/hoadon/create-hoadon.validator.js";
import { validateUpdateHoaDon } from "../validators/hoadon/update-hoadon.validator.js";

import ExcelJS from "exceljs";
import { logger } from "../config/logger.js";

export const HoaDonController = {
  getAll: async (req, res) => {
    try {
      logger.info("Controller: GET /HoaDons");
      const HoaDons = await HoaDonService.getAllHoaDons();
      res.json(HoaDons);
    } catch (err) {
      logger.error("Controller Error: getAll failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  getByMa: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: GET /HoaDons/${MaHD}`);

    try {
      const HoaDon = await HoaDonService.getHoaDonByMa(MaHD);
      res.json(HoaDon);
    } catch (err) {
      logger.error(`Controller Error: getByMa failed (${MaHD})`, err);
      res.status(404).json({ message: err.message });
    }
  },
  // API Phân trang
  // API Phân trang (ĐÃ SỬA: Lấy search từ query)
  getPaginated: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const search = req.query.search || "";
      
      // [MỚI] Lấy tham số lọc từ URL
      const trangThai = req.query.trangThai || "";
      const phuongThuc = req.query.phuongThuc || "";

      // Truyền xuống Service
      const result = await HoaDonService.getPaginatedInvoices(
        page, 
        search, 
        trangThai, 
        phuongThuc
      );
      
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getPaginatedInvoices failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // --- API MỚI: Thống kê số lượng đơn hàng (Dashboard) ---
  getOrderCounts: async (req, res) => {
    try {
      const stats = await HoaDonService.getOrderCounts();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // API Thống kê doanh thu theo năm
  // getStats: async (req, res) => {
  //   try {
  //     const year = req.query.year;
  //     const stats = await HoaDonService.getRevenueStats(year);
  //     res.json(stats);
  //   } catch (err) { res.status(500).json({ message: err.message }); }
  // },

  // API thống kê doanh thu
getStats: async (req, res) => {
  try {
    const { year, month } = req.query;
    const stats = await HoaDonService.getRevenueStats(year, month);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
},


  // Hàm mới: Xử lý yêu cầu lọc theo ngày từ API
  getByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.query; // Lấy từ ?startDate=...&endDate=...
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc" });
      }

      logger.info(`Controller: GET /HoaDons/LocTheoNgay?startDate=${startDate}&endDate=${endDate}`);
      
      const result = await HoaDonService.filterInvoicesByDate(startDate, endDate);
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getByDate failed", err);
      res.status(500).json({ message: err.message });
    }
  },

  // API lấy Top sản phẩm bán chạy
  getTopSelling: async (req, res) => {
    try {
      // Lấy tham số từ URL: /HoaDons/TopBanChay?month=11&year=2025
      const { month, year } = req.query;

      const result = await HoaDonService.getTopSellingStats(month, year);
      
      res.json(result);
    } catch (err) {
      logger.error("Controller Error: getTopSelling failed", err);
      res.status(500).json({ message: err.message });
    }
  },
  exportExcel: async (req, res) => {
    try {
      logger.info("Controller: Exporting HoaDon to Excel");
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách đơn hàng");

      // Tạo cột cho Excel
      worksheet.columns = [
        { header: "Mã HĐ", key: "MaHD", width: 10 },
        { header: "Khách hàng", key: "MaKH", width: 20 },
        { header: "Ngày lập", key: "NgayLap", width: 15 },
        { header: "Tổng tiền", key: "TongTien", width: 15 },
        { header: "Trạng thái", key: "TrangThai", width: 15 },
        { header: "Thanh toán", key: "PhuongThucThanhToan", width: 15 },
        { header: "Ghi chú", key: "GhiChu", width: 30 },
      ];

      // Lấy dữ liệu
      const hoaDons = await HoaDonService.getAllHoaDons(); 

      // Ghi dữ liệu vào các dòng
      hoaDons.forEach((hd) => {
        worksheet.addRow({
          MaHD: hd.MaHD,
          MaKH: hd.TenKhachHang || hd.MaKH, 
          NgayLap: hd.NgayLap ? new Date(hd.NgayLap).toLocaleDateString('vi-VN') : '',
          TongTien: hd.TongTien,
          TrangThai: hd.TrangThai,
          PhuongThucThanhToan: hd.PhuongThucThanhToan,
          GhiChu: hd.GhiChu
        });
      });

      // Thiết lập Header để trình duyệt tải file về
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=DanhSach_DonHang.xlsx");

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      logger.error("Controller Error: exportExcel failed", err);
      res.status(500).json({ message: "Lỗi xuất file Excel" });
    }
  },

  create: async (req, res) => {
    try {
      logger.info("Controller: POST /HoaDons");
      
      // Lấy UserID từ token (Middleware authenticate đã gán vào req.user)
      const userId = req.user.MaTK || req.user.id;

      // Validate dữ liệu gửi lên (Địa chỉ, SĐT...)
      const validatedData = validateCreateHoaDon(req.body);
      const dto = new CreateHoaDonDTO(validatedData);

      // Gọi Service với userId để lấy giỏ hàng của người đó
      const HoaDon = await HoaDonService.createHoaDon(userId, dto);
      
      res.status(201).json(HoaDon);
    } catch (err) {
      logger.error("Controller Error: create failed", err);
      res.status(400).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: PUT /HoaDons/${MaHD}`);
    try {
      const validatedData = validateUpdateHoaDon(req.body);
      const dto = new UpdateHoaDonDTO(validatedData);
      const HoaDon = await HoaDonService.updateHoaDon(MaHD, dto);
      res.json(HoaDon);
    } catch (err) {
      logger.error(`Controller Error: update failed (${MaHD})`, err);
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const MaHD = req.params.MaHD;
    logger.info(`Controller: DELETE /HoaDons/${MaHD}`);
    try {
      const result = await HoaDonService.deleteHoaDon(MaHD);
      res.json(result);
    } catch (err) {
      logger.error(`Controller Error: delete failed (${MaHD})`, err);
      res.status(404).json({ message: err.message });
    }
  },
};