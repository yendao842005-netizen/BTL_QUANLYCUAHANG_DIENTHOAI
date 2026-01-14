export class CreateNhanVienDTO {
  constructor({ MaNV, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam, username, password, role_id }) {
    // 1. Thông tin tài khoản 
    this.username = username;
    this.password = password;
    this.role_id = role_id;

    // 2. Thông tin nhân viên
    this.MaNV = MaNV;
    this.HoTen = HoTen;
    this.NgaySinh = NgaySinh;
    this.GioiTinh = GioiTinh;
    this.SoDienThoai = SoDienThoai;
    this.Email = Email;
    this.DiaChi = DiaChi;
    this.ChucVu = ChucVu;
    this.LuongCoBan = LuongCoBan;
    this.NgayVaoLam = NgayVaoLam;
 }
}
