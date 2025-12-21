import { z } from "zod";

export const createNhanVienSchema = z.object({
  MaNV: z.string({ required_error: "MaNV là bắt buộc" }).max(20),
  HoTen: z.string({ required_error: "HoTen là bắt buộc" }).max(100),
  NgaySinh: z.coerce.date().optional(), // Tự động ép kiểu string sang date
  GioiTinh: z.enum(["Nam", "Nu", "Khac"]).optional(),
  SoDienThoai: z.string({ required_error: "SoDienThoai là bắt buộc" }).max(20),
  Email: z.string().email({ message: "Email không hợp lệ" }).max(100).optional().nullable(),
  DiaChi: z.string().max(255).optional().nullable(),
  ChucVu: z.string().max(50).optional().nullable(),
  LuongCoBan: z.number().min(0).optional(),
  NgayVaoLam: z.coerce.date().optional(),
});

export function validateCreateNhanVien(data) {
  return createNhanVienSchema.parse(data);
}