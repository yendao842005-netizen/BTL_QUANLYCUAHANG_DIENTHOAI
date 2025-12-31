export class UpdateKhachHangDTO {
  constructor({ HoTen, SoDienThoai, DiaChi, Email ,NgaySinh,GioiTinh}) {
    this.HoTen = HoTen;
    this.SoDienThoai = SoDienThoai;
    this.DiaChi = DiaChi;
    this.Email = Email;
    this.NgaySinh = NgaySinh;
    this.GioiTinh = GioiTinh;
  }
}