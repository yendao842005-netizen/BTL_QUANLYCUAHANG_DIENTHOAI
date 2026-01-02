import { DanhMucRepository } from "../repositories/danhmuc.repository.js";
import { DanhMucDTO } from "../dtos/danhmuc/danhmuc.dto.js";
import { logger } from "../config/logger.js";
import ExcelJS from "exceljs";
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
    // SỬA: Trả về trực tiếp results
    return results;
  },

  // Phân trang danh mục (10 dòng/trang)
  getDanhMucsByPage: async (page) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    logger.info(`Service: Pagination DanhMuc - Page ${page}`);
    const { danhMucs, totalItems } = await DanhMucRepository.getPaginated(offset, pageSize);

    return {
      // SỬA: Không map qua new DanhMucDTO(item) nữa để tránh bị mất trường DoanhThu/SoSanPham
      data: danhMucs, 
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
  // Thống kê danh mục
  getStats: async () => {
    logger.info("Service: Getting DanhMuc stats");
    const stats = await DanhMucRepository.getGeneralStats();

    // Tính trung bình (dùng các key tiếng Việt vừa lấy từ Repository)
    const doanhThuTB = stats.TongDanhMuc > 0
      ? stats.TongDoanhThu / stats.TongDanhMuc
      : 0;

    // Trả về object toàn tiếng Việt
    return {
      TongDanhMuc: stats.TongDanhMuc,
      TongSanPham: stats.TongSanPham,
      TongDoanhThu: stats.TongDoanhThu,
      DoanhThuTrungBinh: doanhThuTB
    };
  },
  getDetailCustom: async (MaDM,limit) => {
    logger.info(`Service: Custom Detail for ${MaDM}`);
    const result = await DanhMucRepository.getDetailCustom(MaDM, limit);
    
    if (!result) {
      throw new Error("DanhMuc not found");
    }
    
    return result;
  },


  // --- HÀM MỚI: XUẤT EXCEL ---
  exportToExcel: async () => {
    logger.info("Service: Exporting DanhMuc to Excel");
    
    // 1. Lấy dữ liệu từ Repository (Dùng hàm getAll đã viết trước đó)
    const danhMucs = await DanhMucRepository.getAll();

    // 2. Tạo Workbook và Worksheet mới
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách Danh mục');

    // 3. Định nghĩa các cột (Header)
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Mã DM', key: 'MaDM', width: 15 },
      { header: 'Tên Danh Mục', key: 'TenDanhMuc', width: 25 },
      { header: 'Mô Tả', key: 'MoTa', width: 40 },
      { header: 'Số Sản Phẩm', key: 'SoSanPham', width: 15 },
      { header: 'Doanh Thu (VNĐ)', key: 'DoanhThu', width: 20 }
      //{ header: 'Trạng Thái', key: 'TrangThai', width: 15 }
    ];

    // 4. Định dạng Header (In đậm, màu nền, căn giữa)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } }; // Chữ trắng
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' } // Nền xanh dương
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 5. Thêm dữ liệu vào các dòng
    danhMucs.forEach((dm, index) => {
      const row = worksheet.addRow({
        stt: index + 1,
        MaDM: dm.MaDM,
        TenDanhMuc: dm.TenDanhMuc,
        MoTa: dm.MoTa,
        SoSanPham: dm.SoSanPham,
        DoanhThu: dm.DoanhThu,
        //TrangThai: 'Hoạt động' // Vì ta đang hardcode active ở repo
      });

      // Định dạng số tiền cho cột Doanh Thu (Cột F)
      // numFmt: '#,##0' sẽ hiển thị kiểu 1.000.000
      row.getCell('DoanhThu').numFmt = '#,##0';
      
      // Căn giữa các cột ngắn
      row.getCell('stt').alignment = { horizontal: 'center' };
      row.getCell('MaDM').alignment = { horizontal: 'center' };
      row.getCell('SoSanPham').alignment = { horizontal: 'center' };
      //row.getCell('TrangThai').alignment = { horizontal: 'center' };
    });

    // 6. Trả về đối tượng workbook để Controller ghi ra response
    return workbook;
  },
};