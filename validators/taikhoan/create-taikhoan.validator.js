// import { z } from "zod";

// export const createTaiKhoanSchema = z.object({
//   MaTK: z.string({ required_error: "MaTK là bắt buộc" }).max(20),
//   MaNV: z.string({ required_error: "MaNV là bắt buộc" }).max(20),
//   TenDangNhap: z.string({ required_error: "TenDangNhap là bắt buộc" }).max(50),
//   MatKhau: z.string({ required_error: "MatKhau là bắt buộc" }).min(6).max(255),
//   QuyenHan: z.enum(["QuanLy", "NhanVien"]).default("NhanVien"),
//   TrangThai: z.number().int().min(0).max(1).default(1), // 1: Active, 0: Block
//   NgayTao : z.coerce.date().optional(),
// });
// export function validateCreateTaiKhoan(data) {
//   return createTaiKhoanSchema.parse(data);
// }