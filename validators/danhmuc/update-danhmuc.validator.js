import { z } from "zod";
export const updateDanhMucSchema = z.object({
  TenDanhMuc: z.string().max(100).optional(),
  MoTa: z.string().optional().nullable(),
});
export function validateUpdateDanhMuc(data) {
  return updateDanhMucSchema.parse(data);
}