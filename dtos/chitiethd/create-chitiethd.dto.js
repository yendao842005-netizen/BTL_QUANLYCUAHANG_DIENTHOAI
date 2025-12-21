export class CreateChiTietHoaDonDTO {
  constructor({ ID, MaHD, MaSP, SoLuong, DonGia }) {
    // ThanhTien là cột Generated (tự động tính), không cần truyền vào
    this.ID = ID;
    this.MaHD = MaHD;
    this.MaSP = MaSP;
    this.SoLuong = SoLuong;
    this.DonGia = DonGia;
    
  }
}