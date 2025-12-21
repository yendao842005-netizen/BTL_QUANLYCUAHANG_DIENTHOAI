import { z } from "zod";
export const createChiTietHoaDonSchema = z.object({
  // ID thường tự tăng nên có thể không cần validate khi create, tùy logic BE
  ID: z.number().int().optional(), 
  MaHD: z.string({ required_error: "MaHD là bắt buộc" }).max(20),
  MaSP: z.string({ required_error: "MaSP là bắt buộc" }).max(20),
  SoLuong: z.number({ required_error: "SoLuong là bắt buộc" }).int().min(1),
  DonGia: z.number({ required_error: "DonGia là bắt buộc" }).min(0),
  // ThanhTien là cột Generated (tự tính), không cần validate đầu vào
});
export function validateCreateChiTietHoaDon(data) {
  return createChiTietHoaDonSchema.parse(data);
}