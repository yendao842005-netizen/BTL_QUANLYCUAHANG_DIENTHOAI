import { z } from "zod";
export const updateKhachHangSchema = z.object({
  HoTen: z.string().max(100).optional(),
  SoDienThoai: z.string().max(20).optional(),
  DiaChi: z.string().max(255).optional().nullable(),
  Email: z.string().email().max(100).optional().nullable(),
  NgaySinh: z.string().optional().nullable(),
  GioiTinh: z.enum(["Nam", "Nữ", "Khác"]).optional().nullable(),
});
export function validateUpdateKhachHang(data) {
  return updateKhachHangSchema.parse(data);
}