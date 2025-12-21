export class CreateKhachHangDTO {
  constructor({ MaKH, HoTen, SoDienThoai, DiaChi, Email }) {
    this.MaKH = MaKH;
    this.HoTen = HoTen;
    this.SoDienThoai = SoDienThoai;
    this.DiaChi = DiaChi;
    this.Email = Email;
  }
}