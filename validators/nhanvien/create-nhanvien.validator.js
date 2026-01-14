import { z } from "zod";

export const createNhanVienSchema = z.object({
  // 1. Thông tin Tài khoản (Bắt buộc phải có để tạo login)
  username: z.string({ required_error: "Vui lòng nhập tên đăng nhập" }).min(3),
  password: z.string({ required_error: "Vui lòng nhập mật khẩu" }).min(6),
  role_id: z.number().default(2), // Mặc định là Nhân viên (2)

  // 2. Thông tin Nhân viên (Tiếng Việt)
  // MaNV để optional() vì hệ thống sẽ tự sinh (NV016...)
  MaNV: z.string().optional(), 
  
  HoTen: z.string({ required_error: "Họ tên là bắt buộc" }).min(2).max(100),
  SoDienThoai: z.string({ required_error: "Số điện thoại là bắt buộc" }).max(20),
  
  // Các trường không bắt buộc -> Dùng optional() và nullable()
  Email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal('')),
  DiaChi: z.string().optional().nullable(),
  GioiTinh: z.enum(["Nam", "Nu", "Khac"]).optional().nullable(),
  ChucVu: z.string().optional().nullable(),
  
  // Dùng coerce để tự chuyển chuỗi "2024-01-01" thành Date, hoặc null nếu rỗng
  LuongCoBan: z.coerce.number().min(0).optional().default(0),
  NgaySinh: z.coerce.date().optional().nullable(),
  NgayVaoLam: z.coerce.date().optional().nullable()
});

export function validateCreateNhanVien(data) {
  return createNhanVienSchema.parse(data);
}