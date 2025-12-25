import { NhaCungCapRepository } from "../repositories/ncc.repository.js";
import { NhaCungCapDTO } from "../dtos/nhacungcap/ncc.dto.js";
import { logger } from "../config/logger.js";
import ExcelJS from "exceljs";
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

  //  Lấy danh sách sản phẩm thuộc về NCC này
  getSupplierReport: async (MaNCC) => {
    logger.info(`Service: Generating Report for Supplier ${MaNCC}`);

    // 1. Kiểm tra nhà cung cấp có tồn tại không
    const ncc = await NhaCungCapRepository.getByMa(MaNCC);
    if (!ncc) {
      throw new Error("Nhà cung cấp không tồn tại!");
    }

    // 2. Lấy danh sách sản phẩm
    const products = await NhaCungCapRepository.getProductsBySupplier(MaNCC);

    // 3. Tính toán số liệu tổng hợp (Aggregation)
    // Tính tổng số lượng tồn kho và Tổng giá trị (Số lượng * Giá bán)
    let tongTonKho = 0;
    let tongGiaTri = 0;

    products.forEach(sp => {
      const sl = Number(sp.SoLuongTon) || 0;
      const gia = Number(sp.GiaBan) || 0;
      
      tongTonKho += sl;
      tongGiaTri += (sl * gia);
    });

    // 4. Trả về kết quả gộp
    return {
      supplierInfo: {//thông tin nhà cc
        MaNCC: ncc.MaNCC,
        TenNhaCungCap: ncc.TenNhaCungCap,
        LienHe: ncc.NguoiLienHe,
        SDT: ncc.SoDienThoai
      },
      summary: {//tóm tắt số liệu
        TongSoDauSanPham: products.length, // Đang bán bao nhiêu mã hàng của ông này
        TongSoLuongTon: tongTonKho,        // Tổng số cái đang tồn
        TongGiaTriHang: tongGiaTri         // Tổng tiền đang nằm chết trong kho (tính theo giá bán)
      },
      products: products // Danh sách chi tiết
    };
  },

  // Tạo file Excel xuất danh sách nhà cung cấp
  generateExcel: async () => {
    const data = await NhaCungCapRepository.getAllForExport();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Nhà Cung Cấp");

    worksheet.columns = [
      { header: "Mã NCC", key: "MaNCC", width: 10 },
      { header: "Tên Nhà Cung Cấp", key: "TenNhaCungCap", width: 30 },
      { header: "Người Liên Hệ", key: "NguoiLienHe", width: 20 },
      { header: "SĐT", key: "SoDienThoai", width: 15 },
      { header: "Địa Chỉ", key: "DiaChi", width: 30 },
    ];
    worksheet.getRow(1).font = { bold: true };
    data.forEach(row => worksheet.addRow(row));
    return workbook;
  }
};