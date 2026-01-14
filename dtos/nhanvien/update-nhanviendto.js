export class UpdateNhanVienDTO {
  constructor({ HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam  }) {
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