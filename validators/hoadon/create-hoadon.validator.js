import { z } from "zod";
export const createHoaDonSchema = z.object({
  MaHD: z.string({ required_error: "MaHD là bắt buộc" }).max(20),
  MaKH: z.string().max(20).optional().nullable(),
  MaNV: z.string().max(20).optional().nullable(),
  NgayLap: z.coerce.date().default(() => new Date()),
  TongTien: z.number().min(0).default(0),
  TrangThai: z.enum(["ChoXuLy", "HoanThanh", "DaHuy"]).default("ChoXuLy"),
  GhiChu: z.string().optional().nullable(),
  PhuongThucThanhToan: z.enum(["TienMat", "ChuyenKhoan", "The"]).default("TienMat"),
});
export function validateCreateHoaDon(data) {
  return createHoaDonSchema.parse(data);
}