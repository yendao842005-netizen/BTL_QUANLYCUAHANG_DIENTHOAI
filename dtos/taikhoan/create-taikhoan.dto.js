export class CreateTaiKhoanDTO {
  constructor({ MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai ,NgayTao}) {
    this.MaTK = MaTK;
    this.MaNV = MaNV;
    this.TenDangNhap = TenDangNhap;
    this.MatKhau = MatKhau;
    this.QuyenHan = QuyenHan;
    this.TrangThai = TrangThai;
    this.NgayTao = NgayTao
  }
}