export class CreateHoaDonDTO {
  constructor({MaHD,MaKH,MaNV,NgayLap,TongTien,TrangThai,GhiChu, PhuongThucThanhToan,NguoiNhan,SoDienThoai,DiaChiGiaoHang,NgaySinh,GioiTinh,}) {
    // 1. Thông tin cơ bản của Hóa Đơn (Cũ)
    this.MaHD = MaHD;
    this.MaKH = MaKH;
    this.MaNV = MaNV;
    this.NgayLap = NgayLap;
    this.TongTien = TongTien;
    this.TrangThai = TrangThai;
    this.GhiChu = GhiChu;
    this.PhuongThucThanhToan = PhuongThucThanhToan;

    // 2. [THÊM] Thông tin giao hàng (Lưu vào bảng HoaDon)
    // Các trường này nhận từ Frontend hoặc do Service tự điền từ DB
    this.NguoiNhan = NguoiNhan;
    this.SoDienThoai = SoDienThoai;
    this.DiaChiGiaoHang = DiaChiGiaoHang;

    // 3. [THÊM] Thông tin cá nhân (Dùng để update bảng KhachHang nếu thiếu)
    this.NgaySinh = NgaySinh;
    this.GioiTinh = GioiTinh;
  }
}
