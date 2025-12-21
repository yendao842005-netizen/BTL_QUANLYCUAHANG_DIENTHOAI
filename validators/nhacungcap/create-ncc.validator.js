import { z } from "zod";
export const createNhaCungCapSchema = z.object({
  MaNCC: z.string({ required_error: "MaNCC là bắt buộc" }).max(20),
  TenNhaCungCap: z.string({ required_error: "TenNhaCungCap là bắt buộc" }).max(100),
  NguoiLienHe: z.string().max(50).optional().nullable(),
  SoDienThoai: z.string().max(20).optional().nullable(),
  DiaChi: z.string().max(255).optional().nullable(),
});
export function validateCreateNhaCungCap(data) {
  return createNhaCungCapSchema.parse(data);
}