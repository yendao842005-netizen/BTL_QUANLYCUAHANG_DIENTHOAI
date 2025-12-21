import { z } from "zod";
export const updateTaiKhoanSchema = z.object({
  TenDangNhap: z.string().min(6).max(255).optional(),
  MatKhau: z.string().min(6).max(255).optional(),
  QuyenHan: z.enum(["QuanLy", "NhanVien"]).optional(),
  TrangThai: z.number().int().min(0).max(1).optional(),
});
export function validateUpdateTaiKhoan(data) {
  return updateTaiKhoanSchema.parse(data);
}