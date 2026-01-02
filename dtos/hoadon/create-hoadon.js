export class CreateHoaDonDTO {
  constructor({ MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, GhiChu,PhuongThucThanhToan}) {
    this.MaHD = MaHD;
    this.MaKH = MaKH;
    this.MaNV = MaNV;
    this.NgayLap = NgayLap;
    this.TongTien = TongTien; // Có thể tính toán ở BE, nhưng truyền vào cũng được
    this.TrangThai = TrangThai;
    this.GhiChu = GhiChu;
    this.PhuongThucThanhToan = PhuongThucThanhToan;
  }
}