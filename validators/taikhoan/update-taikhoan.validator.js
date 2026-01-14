import { z } from "zod";

export const updateTaiKhoanSchema = z.object({
  // 1. Reset Mật khẩu (Admin cấp lại pass mới cho user quên pass)
  // Không bắt buộc (optional), chỉ validate nếu có gửi lên
  MatKhau: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(255, "Mật khẩu quá dài")
    .optional(),

  // 2. Thay đổi Quyền hạn (Thăng chức/Giáng chức)
  // Phải khớp với các giá trị ENUM trong CSDL của bạn
  QuyenHan: z.enum(["QuanLy", "NhanVien", "KhachHang"], {
    errorMap: () => ({ message: "Quyền hạn không hợp lệ (Phải là: QuanLy, NhanVien, KhachHang)" })
  }).optional(),

  // 3. Thay đổi Trạng thái (Khóa/Mở tài khoản)
  // 1: Hoạt động, 0: Khóa
  TrangThai: z.number().int()
    .min(0).max(1, "Trạng thái chỉ được là 0 (Khóa) hoặc 1 (Hoạt động)")
    .optional(),
    
  // LƯU Ý: Không cho phép update TenDangNhap hay MaNV/MaKH tại đây 
  // để đảm bảo tính toàn vẹn dữ liệu.
});

export function validateUpdateTaiKhoan(data) {
  return updateTaiKhoanSchema.parse(data);
}