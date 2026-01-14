// dtos/cart/cart.dto.js

export class CartItemDTO {
    constructor(data) {
      this.MaSP = data.product_id || data.MaSP;
      this.TenSanPham = data.name || data.TenSanPham;
      this.HinhAnh = data.image || data.HinhAnh;
      this.DonGia = Number(data.price || data.GiaBan);
      this.SoLuong = Number(data.quantity || data.SoLuong);
      this.ThanhTien = this.DonGia * this.SoLuong;
      this.TonKho = Number(data.stock || data.SoLuongTon); // Để frontend biết mà giới hạn số lượng
    }
}