export const POLICIES = {
  // --- 1. TÀI KHOẢN (System) ---
  ACCOUNT_VIEW_ALL: "ACCOUNT:VIEW_ALL",     // Xem danh sách tài khoản
  ACCOUNT_LOCK: "ACCOUNT:LOCK",             // Khóa tài khoản/Reset pass

  // --- 2. NHÂN VIÊN (HR) ---
  EMPLOYEE_VIEW_ALL: "EMPLOYEE:VIEW_ALL",   // Xem danh sách NV
  EMPLOYEE_CREATE: "EMPLOYEE:CREATE",       // Tạo NV mới (kèm User)
  EMPLOYEE_UPDATE: "EMPLOYEE:UPDATE",       // Sửa chức vụ/lương
  EMPLOYEE_DELETE: "EMPLOYEE:DELETE",       // Xóa NV
  EMPLOYEE_PERFORMANCE: "EMPLOYEE:PERFORMANCE", // Xem hiệu suất bán hàng

  // --- 3. KHÁCH HÀNG (CRM) ---
  CUSTOMER_VIEW_ALL: "CUSTOMER:VIEW_ALL",   // Xem danh sách KH
  CUSTOMER_CREATE: "CUSTOMER:CREATE",       // Tạo KH mới
  CUSTOMER_UPDATE: "CUSTOMER:UPDATE",       // Sửa thông tin KH
  CUSTOMER_DELETE: "CUSTOMER:DELETE",       // Xóa KH
  CUSTOMER_EXPORT: "CUSTOMER:EXPORT",       // Xuất Excel KH

  CUSTOMER_TOP_SPENDERS: "CUSTOMER:TOP_SPENDERS", // Xem thống kê khách VIP
  CUSTOMER_VIEW_DETAIL: "CUSTOMER:VIEW_DETAIL",   // Xem chi tiết 1 khách hàng

  // --- 4. SẢN PHẨM & KHO ---
  PRODUCT_VIEW: "PRODUCT:VIEW",             // Xem sản phẩm (Public)
  PRODUCT_MANAGE: "PRODUCT:MANAGE",         // Thêm/Sửa/Xóa SP, Danh mục, NCC
  INVENTORY_STATS: "INVENTORY:STATS",       // Xem báo cáo tồn kho

  SUPPLIER_MANAGE: "SUPPLIER:MANAGE", // Quyền xem/quản lý nhà cung cấp

  // --- 5. ĐƠN HÀNG (Sales) ---
  ORDER_VIEW_ALL: "ORDER:VIEW_ALL",         // Xem tất cả đơn (Admin/NV)
  ORDER_VIEW_SELF: "ORDER:VIEW_SELF",       // Khách xem đơn mình
  ORDER_CREATE: "ORDER:CREATE",             // Tạo đơn hàng
  ORDER_UPDATE: "ORDER:UPDATE",             // Cập nhật trạng thái đơn
  ORDER_DELETE: "ORDER:DELETE",             // Xóa đơn (Admin)

  // --- 6. THỐNG KÊ & BÁO CÁO ---
  STATS_REVENUE: "STATS:REVENUE",           // Xem doanh thu tổng quan
  DATA_EXPORT: "DATA:EXPORT",               // Quyền xuất dữ liệu nhạy cảm
  
  // --- 7. CÁ NHÂN ---
  PROFILE_UPDATE_SELF: "PROFILE:UPDATE_SELF" // Tự sửa thông tin mình
};