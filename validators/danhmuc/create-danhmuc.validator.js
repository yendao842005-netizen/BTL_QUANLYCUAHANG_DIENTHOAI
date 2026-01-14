import { z } from "zod";
export const createDanhMucSchema = z.object({
  MaDM: z.string().max(20).optional(),
  TenDanhMuc: z.string({ required_error: "TenDanhMuc là bắt buộc" }).max(100),
  MoTa: z.string().optional().nullable(),
});
export function validateCreateDanhMuc(data) {
  return createDanhMucSchema.parse(data);
}