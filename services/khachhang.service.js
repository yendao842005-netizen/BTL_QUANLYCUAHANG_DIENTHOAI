import { KhachHangRepository } from "../repositories/khachhang.ropository.js";
import { TaiKhoanRepository } from "../repositories/taikhoan.repository.js";
import { KhachHangDTO } from "../dtos/khachhang/khachhang.dto.js";
import { logger } from "../config/logger.js";
import ExcelJS from "exceljs";
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
  // Cập nhật hàm tìm kiếm để hỗ trợ phân trang
  searchKhachHangs: async (filters, page = 1) => {
    const pageSize = 10; // Số lượng bản ghi mỗi trang
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Searching KhachHangs - Page ${page}`);

    // Gọi Repository với các tham số lọc + phân trang
    const { khachHangs, totalItems } = await KhachHangRepository.searchAdvanced({
      ...filters,
      limit: pageSize,
      offset: offset
    });
    
    return {
      data: khachHangs.map((item) => {
        const dto = new KhachHangDTO(item); // Tạo DTO chuẩn
        return {
            ...dto, // Lấy toàn bộ thuộc tính của DTO (đã format ngày,...)
            TongDon: item.TongDon ? Number(item.TongDon) : 0,           // Gán thêm từ query gốc
            TongChiTieu: item.TongChiTieu ? Number(item.TongChiTieu) : 0 // Gán thêm từ query gốc
        };
      }),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize: pageSize
      }
    };
  },

  // Phân trang (10 khách hàng mỗi trang)
  getKhachHangsByPage: async (page) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Pagination KhachHang - Page ${page}`);
    const { khachHangs, totalItems } = await KhachHangRepository.getPaginated(offset, pageSize);

    return {
      data: khachHangs.map((item) => {
        const dto = new KhachHangDTO(item); // Tạo DTO chuẩn
        return {
            ...dto, // Lấy toàn bộ thuộc tính của DTO (đã format ngày,...)
            TongDon: item.TongDon ? Number(item.TongDon) : 0,           // Gán thêm từ query gốc
            TongChiTieu: item.TongChiTieu ? Number(item.TongChiTieu) : 0 // Gán thêm từ query gốc
        };
      }),
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: page,
        pageSize: pageSize
      }
    };
  },






  createKhachHang: async (dto) => {
    logger.info(`Service: Creating new KhachHang`);
    
    // Nếu DTO có chứa username và password (tức là muốn tạo tài khoản đăng nhập luôn)
    if (dto.username && dto.password) {
        // Gọi Transaction để tạo KhachHang + TaiKhoan
        const created = await TaiKhoanRepository.registerCustomer(dto);
        return { MaKH: created.user_ref_id, Username: created.username };
    } 
    
    // Nếu chỉ là nhân viên tạo khách vãng lai (không cần login)
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
  deleteKhachHang: async (MaKH) => {
    logger.info(`Service: Deleting KhachHang ${MaKH}`);

    const existing = await KhachHangRepository.getByMa(MaKH);
    if (!existing) throw new Error("KhachHang not found");

    // Xóa tài khoản trước
    await TaiKhoanRepository.deleteByUserRef(MaKH);

    // Xóa khách hàng
    await KhachHangRepository.delete(MaKH);
    return { message: "KhachHang and Account deleted successfully" };
  },



  // Phân loại khách hàng dựa trên dữ liệu Repo trả về
  getVipCustomers: async () => {
    const customers = await KhachHangRepository.getTopSpenders(100);
    
    // Logic xử lý dữ liệu tại Service: Gán hạng (Rank)
    return customers.map(c => {
      let rank = 'Mới';
      const spent = Number(c.TongChiTieu);
      if (spent > 50000000) rank = 'Vip'; // > 50tr
      else if (spent > 20000000) rank = 'Thường'; // > 20tr
      else if (spent > 5000000) rank = 'Mới';   // > 5tr
      
      return { ...c, HangThanhVien: rank };
    });
  },

 getCustomerOrderHistory: async (MaKH) => {
    // 1. Lấy dữ liệu gộp
    const rawData = await KhachHangRepository.getOrdersAndDetails(MaKH);

    // Trường hợp 1: Khách hàng chưa có đơn hàng nào
    if (rawData.length === 0) {
      // Gọi thêm hàm lấy thông tin khách để trả về info cơ bản (dù không có đơn)
      const customerInfo = await KhachHangRepository.getByMa(MaKH);
      if (!customerInfo) throw new Error("Khách hàng không tồn tại");
      
      return {
        KhachHang: customerInfo,
        LichSuMuaHang: []
      };
    }

    // Trường hợp 2: Có dữ liệu mua hàng
    // Lấy thông tin khách từ dòng đầu tiên (vì dòng nào cũng giống nhau phần này)
    const customerInfo = {
      MaKH: MaKH,
      HoTen: rawData[0].HoTen,
      SoDienThoai: rawData[0].SoDienThoai,
      Email: rawData[0].Email,
      DiaChi: rawData[0].DiaChi,
      NgaySinh: rawData[0].NgaySinh, 
      GioiTinh: rawData[0].GioiTinh
    };

    // Gom nhóm Hóa đơn (Logic cũ)
    const ordersMap = new Map();

    rawData.forEach(row => {
      if (!ordersMap.has(row.MaHD)) {
        ordersMap.set(row.MaHD, {
          MaHD: row.MaHD,
          NgayLap: row.NgayLap,
          TongTien: row.TongTien,
          TrangThai: row.TrangThai,
          GhiChu: row.GhiChu,
          ChiTietSanPham: [] 
        });
      }

      const currentOrder = ordersMap.get(row.MaHD);
      currentOrder.ChiTietSanPham.push({
        MaSP: row.MaSP,
        TenSanPham: row.TenSanPham,
        SoLuong: row.SoLuong,
        DonGia: row.DonGia,
        ThanhTien: row.ThanhTien
      });
    });

    // TRẢ VỀ CẤU TRÚC MỚI
    return {
      KhachHang: customerInfo,            // Phần thông tin khách
      LichSuMuaHang: Array.from(ordersMap.values()) // Phần danh sách đơn
    };
  },


  //xuat excel toàn bộ khách hàng
  generateExcel: async () => {
    const data = await KhachHangRepository.getAllForExport();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Khách Hàng");

    worksheet.columns = [
      { header: "Mã KH", key: "MaKH", width: 10 },
      { header: "Họ Tên", key: "HoTen", width: 25 },
      { header: "SĐT", key: "SoDienThoai", width: 15 },
      { header: "Email", key: "Email", width: 25 },
      { header: "Địa Chỉ", key: "DiaChi", width: 30 },
      { header: "Ngày sinh", key: "NgaySinh", width: 15 },
      { header: "Giới tính", key: "GioiTinh", width: 15 },
    ];
    worksheet.getRow(1).font = { bold: true };

    data.forEach(row => worksheet.addRow(row)); // Không cần format ngày tháng vì bảng này không có date quan trọng
    return workbook;
  },


  generateInvoiceExcelForCustomer: async (MaKH) => {
    logger.info(`Service: Generating Excel for Customer ${MaKH}`);

    // 1. Lấy dữ liệu
    const data = await KhachHangRepository.getExportDataByCustomer(MaKH);

    if (data.length === 0) {
      throw new Error("Khách hàng này chưa có đơn hàng nào hoặc không tồn tại!");
    }

    // Lấy thông tin chung khách hàng từ dòng đầu tiên (vì các dòng đều giống nhau phần info khách)
    const customerInfo = data[0];

    // 2. Tạo Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Lịch Sử Mua Hàng");

    // --- PHẦN 1: THÔNG TIN KHÁCH HÀNG (HEADER REPORT) ---
    worksheet.mergeCells('A1:E1'); 
    worksheet.getCell('A1').value = "BÁO CÁO LỊCH SỬ MUA HÀNG";
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.getCell('A3').value = "Khách Hàng:";
    worksheet.getCell('B3').value = customerInfo.HoTen;

    worksheet.getCell('A4').value = "Số Điện Thoại:";
    worksheet.getCell('B4').value = customerInfo.SoDienThoai;

    worksheet.getCell('A5').value = "Địa Chỉ:";
    worksheet.getCell('B5').value = customerInfo.DiaChi;

    // --- PHẦN 2: BẢNG CHI TIẾT SẢN PHẨM ---
    // Bắt đầu từ dòng số 7
    const headerRow = worksheet.getRow(7);
    headerRow.values = ["Mã HĐ", "Ngày Lập", "Trạng Thái", "Sản Phẩm", "Số Lượng", "Đơn Giá", "Thành Tiền"];
    
    // Format Header bảng
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Chữ trắng
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0070C0' } // Nền xanh dương
    };

    // Đổ dữ liệu
    data.forEach(item => {
      worksheet.addRow([
        item.MaHD,
        new Date(item.NgayLap).toLocaleDateString("vi-VN"),
        item.TrangThai,
        item.TenSanPham,
        item.SoLuong,
        item.DonGia,   // Excel tự hiểu là số
        item.ThanhTien // Excel tự hiểu là số
      ]);
    });

    // Chỉnh độ rộng cột cho đẹp
    worksheet.getColumn(1).width = 15; // Mã HĐ
    worksheet.getColumn(2).width = 15; // Ngày
    worksheet.getColumn(3).width = 15; // Trạng thái
    worksheet.getColumn(4).width = 30; // Tên SP
    worksheet.getColumn(5).width = 10; // SL
    worksheet.getColumn(6).width = 15; // Đơn giá
    worksheet.getColumn(7).width = 15; // Thành tiền

    return workbook;
  }
};