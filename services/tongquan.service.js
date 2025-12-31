import { DashboardRepository } from "../repositories/tongquan.repository.js";
import { logger } from "../config/logger.js";
import ExcelJS from "exceljs";
export const DashboardService = {
  getOverviewData: async () => {
    logger.info("Service: Fetching Dashboard Overview");

    try {
      // Gọi song song 3 hàm lấy dữ liệu
      const [cards, chartData, recentOrders] = await Promise.all([
        DashboardRepository.getCardStats(),
        DashboardRepository.getRevenueLast7Days(),
        DashboardRepository.getRecentOrders()
      ]);

      // TRẢ VỀ ĐỐI TƯỢNG VỚI KEY TIẾNG VIỆT
      return {
        // 1. Số liệu tổng quan (Trước là stats)
        thongKeTongQuan: {
            doanhThuHomNay: cards.revenueToday,
            donChoXuLy: cards.pendingOrders,
            tongKhachHang: cards.totalCustomers,
            sanPhamSapHet: cards.lowStockCount
        },
        
        // 2. Dữ liệu biểu đồ (Trước là revenueChart)
        duLieuBieuDo: chartData, 
        
        // 3. Danh sách đơn mới (Trước là recentOrders)
        donHangMoiNhat: recentOrders 
      };
    } catch (err) {
      logger.error("Service Error: getOverviewData failed", err);
      throw err;
    }
  },


  getOverview: async () => {
    const [revenue, orders, customers, products] = await Promise.all([
      DashboardRepository.getRevenueStats(),
      DashboardRepository.getOrderStats(),
      DashboardRepository.getCustomerStats(),
      DashboardRepository.getProductStats()
    ]);

    // 1. Tính % Doanh thu
    let revenuePercent = 0;
    if (revenue.DoanhThuThangTruoc > 0) {
      revenuePercent = ((revenue.DoanhThuThangNay - revenue.DoanhThuThangTruoc) / revenue.DoanhThuThangTruoc) * 100;
    } else if (revenue.DoanhThuThangNay > 0) {
      revenuePercent = 100;
    }

    // 2. Tính % Khách hàng mua đơn
    let customerPercent = 0;
    if (customers.KhachMuaThangTruoc > 0) {
      customerPercent = ((customers.KhachMuaThangNay - customers.KhachMuaThangTruoc) / customers.KhachMuaThangTruoc) * 100;
    } else if (customers.KhachMuaThangNay > 0) {
      customerPercent = 100;
    }

    // 3. Tính % Đơn hàng
    let orderPercent = 0;
    if (orders.DonThangTruoc > 0) {
      orderPercent = ((orders.DonThangNay - orders.DonThangTruoc) / orders.DonThangTruoc) * 100;
    } else if (orders.DonThangNay > 0) {
      orderPercent = 100;
    }

    return {
      DoanhThu: {
        Chinh: revenue.DoanhThuThangNay,
        Phu: revenue.DoanhThuThangTruoc,
        PhanTram: revenuePercent.toFixed(1),
        TangTruong: revenuePercent >= 0
      },
      KhachHang: {
        Chinh: customers.KhachMuaThangNay,
        Tong: customers.TongKhachHang, 
        PhanTram: customerPercent.toFixed(1),
        TangTruong: customerPercent >= 0
      },
      DonHang: {
        Chinh: orders.DonThangNay,
        Phu: orders.DonChoXuLy,
        PhanTram: orderPercent.toFixed(1),
        TangTruong: orderPercent >= 0
      },
      TonKho: {
        Chinh: products.TongTonKho,
        Phu: products.SapHetHang,
        PhanTram: 0,
        TangTruong: true
      }
    };
  },

 // Hàm này dùng cho API: /api/Dashboard/TongQuan
  Vebieudo: async () => {
    // Lấy năm hiện tại
    const currentYear = new Date().getFullYear();

    // Gọi song song 3 hàm lấy dữ liệu từ DB
    const [doanhThuNam, topSanPham, thongKeDanhMuc,donHangMoi] = await Promise.all([
      DashboardRepository.getMonthlyRevenue(2025), // Nên dùng biến currentYear thay vì fix cứng 2025
      DashboardRepository.getTopSellingProducts(),
      DashboardRepository.getCategorySalesStats(),
      DashboardRepository.getRecentOrders1() // <--- THÊM MỚI
    ]);

    // 1. Xử lý Doanh thu 12 tháng (Tạo mảng 12 số 0, có tháng nào thì điền vào tháng đó)
    const mangDoanhThu = Array(12).fill(0);
    doanhThuNam.forEach(item => {
      // item.Thang từ 1-12, index mảng từ 0-11
      mangDoanhThu[item.Thang - 1] = parseInt(item.DoanhThu); 
    });

    // 2. Xử lý Top Sản phẩm
    const tenSanPhamTop = topSanPham.map(p => p.TenSanPham);
    const soLuongBanTop = topSanPham.map(p => p.SoLuongBan);

    // 3. Xử lý Danh mục
    const tenDanhMuc = thongKeDanhMuc.map(c => c.TenDanhMuc);
    const soLuongTheoDanhMuc = thongKeDanhMuc.map(c => c.TongSoLuong);

    return {
      // Cấu trúc dữ liệu tiếng Việt dễ hiểu
      DuLieuBieuDo: {
        DoanhThu: { 
            MangDuLieu: mangDoanhThu // Mảng 12 số doanh thu
        },
        SanPhamBanChay: { 
            DanhSachTen: tenSanPhamTop, // Mảng tên SP
            MangSoLuong: soLuongBanTop  // Mảng số lượng bán
        },
        CoCauDanhMuc: { 
            DanhSachTen: tenDanhMuc,    // Mảng tên danh mục
            MangSoLuong: soLuongTheoDanhMuc // Mảng số lượng
        }
      },
      // 2. Dữ liệu Đơn hàng gần đây (Mới)
      DonHangGanDay: donHangMoi
    };
  },

    // --- HÀM MỚI: XUẤT EXCEL ---
  exportDashboardToExcel: async () => {
    const currentYear = new Date().getFullYear();

    // 1. Lấy dữ liệu từ Database
    
    const [monthlyRev, topProducts, recentOrders, cardStats] = await Promise.all([
      DashboardRepository.getMonthlyRevenue(currentYear),
      DashboardRepository.getTopSellingProducts(),
      DashboardRepository.getRecentOrders(),
      DashboardRepository.getCardStats() // Hàm lấy số liệu 4 thẻ Card (đã có trong Repository của bạn)
    ]);

    // 2. Khởi tạo Workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Báo Cáo Tổng Quan');

    // --- PHẦN 1: TIÊU ĐỀ BÁO CÁO ---
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'BÁO CÁO TỔNG QUAN HỆ THỐNG MOBILE STORE';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4361EE' } }; // Màu xanh chủ đạo

    sheet.mergeCells('A2:E2');
    sheet.getCell('A2').value = `Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}`;
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    // --- PHẦN 2: THỐNG KÊ NHANH (CARDS) ---
    sheet.addRow([]); // Dòng trống
    sheet.addRow(['I. CHỈ SỐ QUAN TRỌNG TRONG NGÀY']).font = { bold: true };
    
    // Tạo header cho bảng chỉ số
    const headerRowStats = sheet.addRow(['Doanh thu hôm nay', 'Đơn chờ xử lý', 'Tổng khách hàng', 'SP Sắp hết hàng']);
    headerRowStats.font = { bold: true };
    
    // Điền dữ liệu
    sheet.addRow([
      cardStats.revenueToday, // Cần format tiền tệ sau
      cardStats.pendingOrders,
      cardStats.totalCustomers,
      cardStats.lowStockCount
    ]);

    // Format tiền tệ cho ô Doanh thu (Dòng 6, Cột 1)
    sheet.getCell('A6').numFmt = '#,##0 "đ"'; 

    // --- PHẦN 3: ĐƠN HÀNG GẦN ĐÂY ---
    sheet.addRow([]);
    sheet.addRow(['II. ĐƠN HÀNG MỚI NHẤT']).font = { bold: true };
    
    // Header bảng đơn hàng
    const headerRowOrders = sheet.addRow(['Mã HĐ', 'Khách Hàng', 'Ngày Lập', 'Tổng Tiền', 'Trạng Thái']);
    headerRowOrders.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7209B7' } }; // Màu tím
    });

    // Dữ liệu đơn hàng
    recentOrders.forEach(order => {
      const row = sheet.addRow([
        order.MaHD,
        order.TenKhachHang || 'Khách vãng lai',
        new Date(order.NgayLap),
        order.TongTien,
        order.TrangThai === 'HoanThanh' ? 'Hoàn thành' : 
        order.TrangThai === 'ChoXuLy' ? 'Chờ xử lý' : 'Đã hủy'
      ]);
      
      // Format ngày và tiền
      row.getCell(3).numFmt = 'dd/mm/yyyy hh:mm';
      row.getCell(4).numFmt = '#,##0 "đ"';
    });

    // --- PHẦN 4: TOP SẢN PHẨM BÁN CHẠY ---
    sheet.addRow([]);
    sheet.addRow(['III. TOP 5 SẢN PHẨM BÁN CHẠY']).font = { bold: true };

    const headerRowProducts = sheet.addRow(['STT', 'Tên Sản Phẩm', 'Số Lượng Đã Bán']);
    headerRowProducts.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF72585' } }; // Màu hồng
    });

    topProducts.forEach((prod, index) => {
      sheet.addRow([index + 1, prod.TenSanPham, prod.SoLuongBan]);
    });

    // --- CẤU HÌNH ĐỘ RỘNG CỘT ---
    sheet.getColumn(1).width = 20; // Cột A
    sheet.getColumn(2).width = 30; // Cột B
    sheet.getColumn(3).width = 20; // Cột C
    sheet.getColumn(4).width = 20; // Cột D
    sheet.getColumn(5).width = 20; // Cột E

    return workbook;
  },


};