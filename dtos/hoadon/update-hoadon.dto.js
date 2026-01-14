export class UpdateHoaDonDTO {
  constructor({ TongTien, TrangThai, GhiChu ,PhuongThucThanhToan ,NguoiNhan ,SoDienThoai ,DiaChiGiaoHang}) {
    // Thường hóa đơn chỉ update Trạng thái, Ghi chú hoặc Tổng tiền khi sửa chi tiết
    this.TongTien = TongTien;
    this.TrangThai = TrangThai;
    this.GhiChu = GhiChu;
    this.PhuongThucThanhToan = PhuongThucThanhToan;

    this.NguoiNhan = NguoiNhan;
    this.SoDienThoai = SoDienThoai;
    this.DiaChiGiaoHang = DiaChiGiaoHang;
  }
}