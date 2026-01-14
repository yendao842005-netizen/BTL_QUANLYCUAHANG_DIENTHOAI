export class HoaDonDTO {
  constructor({ MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu ,PhuongThucThanhToan ,NguoiNhan ,SoDienThoai ,DiaChiGiaoHang}) {
    this.MaHD = MaHD;
    this.MaKH = MaKH;
    this.MaNV = MaNV;
    this.NgayLap = NgayLap;
    this.TongTien = TongTien;
    this.TrangThai = TrangThai;
    this.GhiChu = GhiChu;
    this.PhuongThucThanhToan = PhuongThucThanhToan;

    this.NguoiNhan = NguoiNhan;
    this.SoDienThoai = SoDienThoai;     // SĐT người nhận hàng
    this.DiaChiGiaoHang = DiaChiGiaoHang; // Địa chỉ giao hàng
  }
}