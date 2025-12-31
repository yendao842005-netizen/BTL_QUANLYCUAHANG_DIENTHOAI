export class UpdateSanPhamDTO {
  constructor({ TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, MoTa,HinhAnh }) {
    this.TenSanPham = TenSanPham;
    this.MaDM = MaDM;
    this.MaNCC = MaNCC;
    this.GiaBan = GiaBan;
    this.SoLuongTon = SoLuongTon;
    this.NgayNhap = NgayNhap;
    this.MoTa = MoTa;
    // THÊM DÒNG NÀY
    this.HinhAnh = HinhAnh;
  }
}