export class UpdateTaiKhoanDTO {
  constructor({ TenDangNhap,MatKhau, QuyenHan, TrangThai }) {
    // Thường không cho đổi TenDangNhap hay MaNV
    this.TenDangNhap = TenDangNhap;
    this.MatKhau = MatKhau;
    this.QuyenHan = QuyenHan;
    this.TrangThai = TrangThai;
  }
}