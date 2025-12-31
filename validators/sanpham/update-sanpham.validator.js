import { z } from "zod";

export const updateSanPhamSchema = z.object({
  
  TenSanPham: z.string().max(255).optional(),
  MaDM: z.string().max(20).optional().nullable(),
  MaNCC: z.string().max(20).optional().nullable(),
  GiaBan: z.number().min(0).optional(),
  SoLuongTon: z.number().int().min(0).optional(),
  NgayNhap: z.coerce.date().optional(),
  MoTa: z.string().optional().nullable(),
  // THÊM DÒNG NÀY
  HinhAnh: z.string().max(255).optional().nullable(), 
});

export function validateUpdateSanPham(data) {
  return updateSanPhamSchema.parse(data);
}
