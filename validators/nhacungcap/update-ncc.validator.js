import { z } from "zod";
export const updateNhaCungCapSchema = z.object({
  TenNhaCungCap: z.string().max(100).optional(),
  NguoiLienHe: z.string().max(50).optional().nullable(),
  SoDienThoai: z.string().max(20).optional().nullable(),
  DiaChi: z.string().max(255).optional().nullable(),
});
export function validateUpdateNhaCungCap(data) {
  return updateNhaCungCapSchema.parse(data);
}