import { z } from "zod";
export const createKhachHangSchema = z.object({
  MaKH: z.string().optional(),
  HoTen: z.string({ required_error: "HoTen là bắt buộc" }).max(100),
  SoDienThoai: z.string({ required_error: "SoDienThoai là bắt buộc" }).max(20),
  DiaChi: z.string().max(255).optional().nullable(),
  Email: z.string().email().max(100).optional().nullable(),
  NgaySinh: z.string().optional().nullable(),
  GioiTinh: z.enum(["Nam", "Nu", "Khac"]).optional().nullable(),
});
export function validateCreateKhachHang(data) {
  return createKhachHangSchema.parse(data);
}