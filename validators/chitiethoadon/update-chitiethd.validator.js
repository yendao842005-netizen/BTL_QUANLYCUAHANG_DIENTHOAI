import { z } from "zod";
export const updateChiTietHoaDonSchema = z.object({
  SoLuong: z.number().int().min(1).optional(),
  DonGia: z.number().min(0).optional(),
});
export function validateUpdateChiTietHoaDon(data) {
  return updateChiTietHoaDonSchema.parse(data);
}