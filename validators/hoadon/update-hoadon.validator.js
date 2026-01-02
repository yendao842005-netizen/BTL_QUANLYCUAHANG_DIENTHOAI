import { z } from "zod";
export const updateHoaDonSchema = z.object({
  TongTien: z.number().min(0).optional(),
  TrangThai: z.enum(["ChoXuLy", "HoanThanh", "DaHuy"]).optional(),
  GhiChu: z.string().optional().nullable(),
  PhuongThucThanhToan: z.enum(["TienMat", "ChuyenKhoan", "The"]).optional(),
});
export function validateUpdateHoaDon(data) {
  return updateHoaDonSchema.parse(data);
}