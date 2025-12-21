import { z } from "zod";

export const createSanPhamSchema = z.object({
  MaSP: z.string({ required_error: "MaSP là bắt buộc" }).max(20),
  TenSanPham: z.string({ required_error: "TenSanPham là bắt buộc" }).max(255),
  MaDM: z.string().max(20).optional().nullable(),
  MaNCC: z.string().max(20).optional().nullable(),
  GiaBan: z.number({ required_error: "GiaBan là bắt buộc" }).min(0),
  SoLuongTon: z.number().int().min(0).default(0),
  NgayNhap: z.coerce.date().default(() => new Date()),
  MoTa: z.string().optional().nullable(),
});

export function validateCreateSanPham(data) {
  return createSanPhamSchema.parse(data);
}
