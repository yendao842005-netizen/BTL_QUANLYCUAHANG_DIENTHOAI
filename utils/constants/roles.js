// Dùng để so sánh trong code logic
export const ROLES = {
    ADMIN: 1,      // Tương ứng QuanLy
    EMPLOYEE: 2,   // Tương ứng NhanVien
    CUSTOMER: 3    // Tương ứng KhachHang
  };
  
  // Dùng để hiển thị ra giao diện (nếu cần)
  export const ROLE_NAMES = {
    1: 'QuanLy',
    2: 'NhanVien',
    3: 'KhachHang'
  };
  
  // Dùng để map dữ liệu từ DB lên Code
  // Input: 'QuanLy' (từ SQL) -> Output: 1
  export function getRoleId(dbRoleEnum) {
    if (dbRoleEnum === 'QuanLy') return ROLES.ADMIN;
    if (dbRoleEnum === 'NhanVien') return ROLES.EMPLOYEE;
    return ROLES.CUSTOMER; // Mặc định còn lại là khách
  }
  
  // Dùng để map từ Code xuống DB để lưu
  // Input: 1 -> Output: 'QuanLy'
  export function getRoleName(roleId) {
    if (roleId === ROLES.ADMIN) return 'QuanLy';
    if (roleId === ROLES.EMPLOYEE) return 'NhanVien';
    return 'KhachHang';
  }