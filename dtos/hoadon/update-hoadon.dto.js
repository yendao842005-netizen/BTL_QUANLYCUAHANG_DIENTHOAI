export class UpdateHoaDonDTO {
  constructor({ TongTien, TrangThai, GhiChu ,PhuongThucThanhToan}) {
    // Thường hóa đơn chỉ update Trạng thái, Ghi chú hoặc Tổng tiền khi sửa chi tiết
    this.TongTien = TongTien;
    this.TrangThai = TrangThai;
    this.GhiChu = GhiChu;
    this.PhuongThucThanhToan = PhuongThucThanhToan;
  }
}