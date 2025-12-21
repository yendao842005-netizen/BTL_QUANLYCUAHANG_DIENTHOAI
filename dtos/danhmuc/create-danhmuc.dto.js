export class CreateDanhMucDTO {
  constructor({ MaDM, TenDanhMuc, MoTa }) {
    this.MaDM = MaDM;
    this.TenDanhMuc = TenDanhMuc;
    this.MoTa = MoTa;
  }
}