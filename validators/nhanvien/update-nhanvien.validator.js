import { z } from "zod";
export const updateNhanVienSchema = z.object({
  HoTen: z.string().max(100).optional(),
  NgaySinh: z.coerce.date().optional(),
  GioiTinh: z.enum(["Nam", "Nu", "Khac"]).optional(),
  SoDienThoai: z.string().max(20).optional(),
  Email: z.string().email().max(100).optional().nullable(), 
  DiaChi: z.string().max(255).optional().nullable(),
  ChucVu: z.string().max(50).optional().nullable(),
  LuongCoBan: z.number().min(0).optional(),
  NgayVaoLam: z.coerce.date().optional(),
});
export function validateUpdateNhanVien(data) {
  return updateNhanVienSchema.parse(data);
}