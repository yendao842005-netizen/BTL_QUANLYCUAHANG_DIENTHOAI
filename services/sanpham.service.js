import { SanPhamRepository } from "../repositories/sanpham.repository.js";
import { SanPhamDTO } from "../dtos/sanpham/sanpham.dto.js";
import { logger } from "../config/logger.js";
import ExcelJS from "exceljs";

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
    const pageSize = 16;
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
    const pageSize = 16; // 10 dòng mỗi trang
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

// THỐNG KÊ KHO: Sắp hết hàng & Tồn kho lâu
  getInventoryReport: async (threshold) => {
    // Nếu không truyền threshold, mặc định là 10
    const limit = threshold ? parseInt(threshold) : 10;
    
    logger.info(`Service: Generating Inventory Report (Threshold: ${limit})`);
    
    const stats = await SanPhamRepository.getInventoryStats(limit);
    
    // Có thể xử lý thêm logic phụ ở đây nếu cần (VD: Gắn nhãn 'Cần nhập gấp')
    const processedLowStock = stats.lowStock.map(sp => ({
      ...new SanPhamDTO(sp),
      TrangThai: 'Cần nhập thêm',
      CanhBao: `Chỉ còn ${sp.SoLuongTon} sản phẩm`
    }));

    const processedOldStock = stats.oldStock.map(sp => ({
      ...new SanPhamDTO(sp),
      TrangThai: 'Khó bán / Tồn lâu',
      CanhBao: `Đã nhập ${sp.SoNgayTon} ngày`
    }));

    return {
      lowStock: processedLowStock, // Danh sách sắp hết
      oldStock: processedOldStock  // Danh sách tồn lâu
    };
  },

  // Tạo file Excel xuất danh sách sản phẩm
  generateExcel: async () => {
    logger.info("Service: Generating Excel Workbook");

    // 1. Lấy dữ liệu từ DB
    const products = await SanPhamRepository.getAllForExport();

    // 2. Tạo Workbook (File Excel ảo)
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh Sách Sản Phẩm");

    // 3. Định nghĩa các Cột (Header)
    worksheet.columns = [
      { header: "Mã SP", key: "MaSP", width: 10 },
      { header: "Tên Sản Phẩm", key: "TenSanPham", width: 30 },
      { header: "Danh Mục", key: "TenDanhMuc", width: 15 },
      { header: "Nhà Cung Cấp", key: "TenNhaCungCap", width: 20 },
      { header: "Giá Bán (VNĐ)", key: "GiaBan", width: 15 },
      { header: "Tồn Kho", key: "SoLuongTon", width: 10 },
      { header: "Ngày Nhập", key: "NgayNhap", width: 15 },
      { header: "Mô Tả", key: "MoTa", width: 25 },
    ];

    // 4. Định dạng Header (In đậm, căn giữa)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 5. Đổ dữ liệu vào
    products.forEach((product) => {
      worksheet.addRow({
        ...product,
        // Format lại ngày tháng cho đẹp nếu cần
        NgayNhap: new Date(product.NgayNhap).toLocaleDateString("vi-VN") 
      });
    });

    // 6. Trả về đối tượng workbook (để Controller ghi ra response)
    return workbook;
  },
  // Trong object SanPhamService

  getCategoryReport: async () => {
    const stats = await SanPhamRepository.getCategoryStats();
    return stats;
  },


  getGeneralStats: async () => {
    return await SanPhamRepository.getGeneralStats();
  },
};
