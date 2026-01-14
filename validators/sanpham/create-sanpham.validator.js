import { z } from "zod";

export const createSanPhamSchema = z.object({
  MaSP: z.string().max(20).optional(),
  TenSanPham: z.string({ required_error: "TenSanPham là bắt buộc" }).max(255),
  MaDM: z.string().max(20).optional().nullable(),
  MaNCC: z.string().max(20).optional().nullable(),
  GiaBan: z.number({ required_error: "GiaBan là bắt buộc" }).min(0),
  SoLuongTon: z.number().int().min(0).default(0),
  NgayNhap: z.coerce.date().default(() => new Date()),
  MoTa: z.string().optional().nullable(),
  // THÊM DÒNG NÀY
  HinhAnh: z.string().max(255).optional().nullable(),
});

export function validateCreateSanPham(data) {
  return createSanPhamSchema.parse(data);
}
