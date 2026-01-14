import { getRoleId, getRoleName } from "../../utils/constants/roles.js";

export class TaiKhoanDTO {
  constructor(data) {
    this.MaTK = data.MaTK || data.id; // Support cả 2 tên trường
    this.TenDangNhap = data.TenDangNhap || data.username;
    this.UserRefId = data.MaNV || data.MaKH || data.user_ref_id; // ID của NV hoặc KH
    
    // Xử lý QuyenHan: Nếu DB trả về chữ -> đổi sang số và ngược lại
    if (typeof data.QuyenHan === 'string') {
        this.QuyenHan = data.QuyenHan; // "QuanLy"
        this.RoleId = getRoleId(data.QuyenHan); // 1
    } else if (data.role_id) {
        this.RoleId = data.role_id; // 1
        this.QuyenHan = getRoleName(data.role_id); // "QuanLy"
    }

    // Xử lý TrangThai: DB lưu BIT (Buffer) hoặc Int
    // Nếu data.TrangThai là Buffer (MySQL BIT), ta cần convert
    this.TrangThai = (data.TrangThai && data.TrangThai[0] === 1) || data.TrangThai === 1 ? 1 : 0;
    
    this.NgayTao = data.NgayTao;
    
    // TUYỆT ĐỐI KHÔNG TRẢ VỀ MATKHAU (PASSWORD)
  }
}