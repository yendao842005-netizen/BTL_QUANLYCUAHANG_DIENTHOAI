import { TaiKhoanRepository } from "../repositories/taikhoan.repository.js";
import { TaiKhoanDTO } from "../dtos/taikhoan/taikhoan.dto.js";
import { logger } from "../config/logger.js";

export const TaiKhoanService = {
  getAllTaiKhoans: async () => {
    logger.info("Service: Getting all TaiKhoans");
    const taiKhoans = await TaiKhoanRepository.getAll();
    return taiKhoans.map((u) => new TaiKhoanDTO(u));
  },

  getTaiKhoanByMa: async (MaTK) => {
    logger.info(`Service: Getting TaiKhoan by Ma ${MaTK}`);
    const taiKhoan = await TaiKhoanRepository.getByMa(MaTK);

    if (!taiKhoan) {
      logger.warn(`Service Warning: TaiKhoan ${MaTK} not found`);
      throw new Error("TaiKhoan not found");
    }

    return new TaiKhoanDTO(taiKhoan);
  },

  login: async (TenDangNhap, MatKhau) => {
    logger.info(`Service: Processing login for user ${TenDangNhap}`); //
    // 1. Kiểm tra tài khoản tồn tại
    const taiKhoan = await TaiKhoanRepository.getByTenDangNhap(TenDangNhap); //
    if (!taiKhoan) {
      throw new Error("Tên đăng nhập không chính xác");
    }

    if (taiKhoan.TrangThai == 0) { //
      throw new Error("Tài khoản của bạn đã bị khóa");
    }
    if (taiKhoan.MatKhau !== MatKhau) { //
      throw new Error("Mật khẩu không chính xác");
    }
    return new TaiKhoanDTO(taiKhoan); //
  },

  getTaiKhoansByPage: async (page) => {
    const pageSize = 5; // Quy định 10 dòng mỗi trang
    const offset = (page - 1) * pageSize; // Tính toán vị trí bắt đầu

    logger.info(`Service: Pagination - Page ${page}, Size ${pageSize}`);
    
    const { taiKhoans, totalItems } = await TaiKhoanRepository.getPaginated(offset, pageSize);

    return {
      data: taiKhoans.map((u) => new TaiKhoanDTO(u)), // Chuyển đổi sang DTO
      pagination: {
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / pageSize), // Tính tổng số trang
        currentPage: page,
        pageSize: pageSize
      }
    };
  },
  
  createTaiKhoan: async (dto) => {
    logger.info(`Service: Creating new TaiKhoan ${dto.MaTK}`);
    // Lưu ý: Mật khẩu nên được hash trước khi gọi repository create nếu chưa xử lý
    const created = await TaiKhoanRepository.create(dto);
    return new TaiKhoanDTO(created);
  },

  updateTaiKhoan: async (MaTK, dto) => {
    logger.info(`Service: Updating TaiKhoan ${MaTK}`);

    const existing = await TaiKhoanRepository.getByMa(MaTK);
    if (!existing) {
      logger.warn(`Service Warning: Cannot update. TaiKhoan ${MaTK} not found`);
      throw new Error("TaiKhoan not found");
    }

    const updated = await TaiKhoanRepository.update(MaTK, dto);
    return new TaiKhoanDTO(updated);
  },

  deleteTaiKhoan: async (MaTK) => {
    logger.info(`Service: Deleting TaiKhoan ${MaTK}`);

    const existing = await TaiKhoanRepository.getByMa(MaTK);
    if (!existing) {
      logger.warn(`Service Warning: Cannot delete. TaiKhoan ${MaTK} not found`);
      throw new Error("TaiKhoan not found");
    }

    await TaiKhoanRepository.delete(MaTK);
    return { message: "TaiKhoan deleted successfully" };
  },
};