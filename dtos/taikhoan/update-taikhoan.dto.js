export class UpdateTaiKhoanDTO {
  constructor(data) {
    // 1. Cập nhật Trạng thái (Khóa/Mở)
    // Chuyển đổi sang kiểu số nguyên (1 hoặc 0) để lưu vào DB an toàn
    if (data.TrangThai !== undefined) {
      this.TrangThai = Number(data.TrangThai);
    }

    // 2. Cập nhật Quyền hạn (Admin thăng chức/giáng chức)
    // Chỉ lấy nếu có dữ liệu gửi lên
    if (data.QuyenHan) {
      this.QuyenHan = data.QuyenHan; // 'QuanLy' hoặc 'NhanVien'
    }

    // 3. Reset Mật khẩu (Admin cấp lại pass mới)
    // Lưu ý: Mật khẩu này chưa Hash, Service sẽ lo việc Hash
    if (data.MatKhau) {
      this.MatKhau = data.MatKhau;
    }

    // Lưu ý: Không cho phép đổi TenDangNhap hay MaNV/MaKH ở đây
    // Vì nó liên quan đến tính toàn vẹn dữ liệu hệ thống
  }
}