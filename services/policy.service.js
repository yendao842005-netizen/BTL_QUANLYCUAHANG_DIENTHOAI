import { POLICIES } from "../utils/constants/policies.js";
import { ROLES } from "../utils/constants/roles.js";

// BẢNG PHÂN QUYỀN (Role Permissions)
const rolePermissions = {
  // --- 1. ADMIN (QUẢN LÝ - ID 1) ---
  // Được làm tất cả mọi thứ
  [ROLES.ADMIN]: [
    // Tài khoản & Nhân sự
    POLICIES.ACCOUNT_VIEW_ALL, POLICIES.ACCOUNT_LOCK,
    POLICIES.EMPLOYEE_VIEW_ALL, POLICIES.EMPLOYEE_CREATE, 
    POLICIES.EMPLOYEE_UPDATE, POLICIES.EMPLOYEE_DELETE, 
    POLICIES.EMPLOYEE_PERFORMANCE,

    // Khách hàng
    POLICIES.CUSTOMER_VIEW_ALL, POLICIES.CUSTOMER_CREATE, 
    POLICIES.CUSTOMER_UPDATE, POLICIES.CUSTOMER_DELETE, 
    POLICIES.CUSTOMER_EXPORT,

    POLICIES.CUSTOMER_TOP_SPENDERS, // Để xem báo cáo khách VIP
    POLICIES.CUSTOMER_VIEW_DETAIL,  // Để xem chi tiết khách
    POLICIES.SUPPLIER_MANAGE,       // [QUAN TRỌNG] Để vào được trang Nhà Cung Cấp

    // Sản phẩm & Kho
    POLICIES.PRODUCT_VIEW, POLICIES.PRODUCT_MANAGE, 
    POLICIES.INVENTORY_STATS,

    // Đơn hàng
    POLICIES.ORDER_VIEW_ALL, POLICIES.ORDER_CREATE, 
    POLICIES.ORDER_UPDATE, POLICIES.ORDER_DELETE,

    // Báo cáo
    POLICIES.STATS_REVENUE, POLICIES.DATA_EXPORT
  ],

  // --- 2. EMPLOYEE (NHÂN VIÊN - ID 2) ---
  // Chỉ bán hàng và xem thông tin cần thiết
  [ROLES.EMPLOYEE]: [
    // Khách hàng (Để hỗ trợ bán)
    POLICIES.CUSTOMER_VIEW_ALL, POLICIES.CUSTOMER_CREATE, 
    POLICIES.CUSTOMER_UPDATE,
    // (Không được Xóa KH, Không được Xuất Excel KH)

    POLICIES.CUSTOMER_VIEW_DETAIL,  // Nhân viên cần xem chi tiết để gọi điện/ship hàng
    POLICIES.SUPPLIER_MANAGE,    // <-- Bỏ comment dòng này nếu bạn muốn Nhân viên cũng xem được Nhà cung cấp
    
    // Sản phẩm (Để tư vấn)
    POLICIES.PRODUCT_VIEW, 
    POLICIES.INVENTORY_STATS, // Cần xem tồn kho để báo khách
    // (Không được nhập hàng/sửa giá - PRODUCT_MANAGE)

    // Đơn hàng (Nhiệm vụ chính)
    POLICIES.ORDER_VIEW_ALL, POLICIES.ORDER_CREATE, 
    POLICIES.ORDER_UPDATE
    // (Không được Xóa đơn)
  ],

  // --- 3. CUSTOMER (KHÁCH HÀNG - ID 3) ---
  [ROLES.CUSTOMER]: [
    POLICIES.PRODUCT_VIEW,        // Xem hàng
    POLICIES.ORDER_CREATE,        // Mua hàng
    POLICIES.ORDER_VIEW_SELF,     // Xem đơn của mình
    POLICIES.PROFILE_UPDATE_SELF  // Sửa hồ sơ mình
  ]
};

export async function checkPolicy({ user, policy, resourceId = null }) {
  // 1. Lấy danh sách quyền của Role
  const userPerms = rolePermissions[user.role] || [];

  // 2. Nếu Role này không có quyền -> Chặn ngay
  if (!userPerms.includes(policy)) return false;

  // 3. Kiểm tra nâng cao (Sở hữu dữ liệu)
  
  // Trường hợp: Khách xem đơn hàng
  if (policy === POLICIES.ORDER_VIEW_SELF) {
    // Logic: Nếu là Admin/NV thì luôn đúng (đã check ở trên rồi)
    // Nếu là Khách: Controller phải đảm bảo chỉ lấy đơn của user.sub
    // Ở bước này ta trả về true (cho phép đi tiếp vào Controller)
    return true; 
  }

  // Trường hợp: Tự sửa hồ sơ
  if (policy === POLICIES.PROFILE_UPDATE_SELF) {
    // resourceId (gửi từ params) phải trùng với user.sub (trong token)
    return resourceId === user.sub;
  }

  return true;
}