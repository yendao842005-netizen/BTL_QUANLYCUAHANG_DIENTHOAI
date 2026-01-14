import { Router } from "express";

// --- Import Controllers ---
import { NhanVienController } from "../controllers/nhanvien.controller.js";
import { TaiKhoanController } from "../controllers/taikhoan.controller.js";
import { DanhMucController } from "../controllers/danhmuc.controller.js";
import { NhaCungCapController } from "../controllers/ncc.controller.js";
import { KhachHangController } from "../controllers/khachhang.controller.js";
import { SanPhamController } from "../controllers/sanpham.controller.js";
import { HoaDonController } from "../controllers/hoadon.controller.js";
import { ChiTietHoaDonController } from "../controllers/chitiethd.controller.js";
import { DashboardController } from "../controllers/tongquan.controller.js";
import { registerUser, loginUser } from "../controllers/auth.controller.js"; // Import Auth Controller
import { CartController } from "../controllers/cart.controller.js"; 
import { addToCartSchema, updateCartSchema } from "../validators/cart.validator.js"; 

// --- Import Middlewares & Policies ---
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizePolicy } from "../middlewares/policy.middleware.js";
import { POLICIES } from "../utils/constants/policies.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerCustomerSchema, loginSchema } from "../validators/authens/auth.validator.js";
import { z } from "zod";

const router = Router();

const resetPassSchema = z.object({
    newPassword: z.string().min(6, "Mật khẩu phải từ 6 ký tự")
  });

// ==========================================
// 1. AUTHENTICATION (Public Routes)
// ==========================================
// Đăng ký cho khách hàng (Public)
router.post("/auth/register", validate(registerCustomerSchema), registerUser);

// Đăng nhập (Dùng chung cho Admin, NV, Khách)
router.post("/auth/login", validate(loginSchema), loginUser);


// ==========================================
// 2. NHÂN VIÊN (HR Management - Chỉ Admin)
// ==========================================
// Xem danh sách
router.get("/NhanViens", authenticate, authorizePolicy(POLICIES.EMPLOYEE_VIEW_ALL), NhanVienController.getAll);
router.get("/NhanViens/PhanTrang", authenticate, authorizePolicy(POLICIES.EMPLOYEE_VIEW_ALL), NhanVienController.getPaginated);
router.get("/NhanViens/Search", authenticate, authorizePolicy(POLICIES.EMPLOYEE_VIEW_ALL), NhanVienController.search);

// Báo cáo hiệu suất (Chỉ Admin xem được)
router.get("/NhanViens/BaoCao/HieuSuat", authenticate, authorizePolicy(POLICIES.EMPLOYEE_PERFORMANCE), NhanVienController.getPerformanceReport);

// URL: http://localhost:3000/api/NhanViens/Stats/Dashboard
router.get("/NhanViens/Stats/Dashboard", authenticate, authorizePolicy(POLICIES.EMPLOYEE_VIEW_ALL), NhanVienController.getDashboardStats);
// URL: http://localhost:3000/api/NhanViens/Stats/TopRevenue
router.get("/NhanViens/Stats/TopRevenue", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), NhanVienController.getTopRevenue);

// Xuất Excel DS Nhân viên (Dữ liệu nhạy cảm -> Cần quyền DATA_EXPORT)
router.get("/NhanViens/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), NhanVienController.exportToExcel);

// Chi tiết, Tạo, Sửa, Xóa (Chỉ Admin)
router.get("/NhanViens/:MaNV", authenticate, authorizePolicy(POLICIES.EMPLOYEE_VIEW_ALL), NhanVienController.getByMa);
router.post("/NhanViens", authenticate, authorizePolicy(POLICIES.EMPLOYEE_CREATE), NhanVienController.create);
router.put("/NhanViens/:MaNV", authenticate, authorizePolicy(POLICIES.EMPLOYEE_UPDATE), NhanVienController.update);
router.delete("/NhanViens/:MaNV", authenticate, authorizePolicy(POLICIES.EMPLOYEE_DELETE), NhanVienController.delete);
router.put("/NhanViens/:MaNV/ResetPassword", authenticate, authorizePolicy(POLICIES.EMPLOYEE_UPDATE), validate(resetPassSchema),NhanVienController.resetPassword );


// ==========================================
// 3. TÀI KHOẢN (System Management - Chỉ Admin)
// ==========================================
router.get("/TaiKhoans", authenticate, authorizePolicy(POLICIES.ACCOUNT_VIEW_ALL), TaiKhoanController.getAll);
router.get("/TaiKhoans/PhanTrang", authenticate, authorizePolicy(POLICIES.ACCOUNT_VIEW_ALL), TaiKhoanController.getPaginated);
router.get("/TaiKhoans/:MaTK", authenticate, authorizePolicy(POLICIES.ACCOUNT_VIEW_ALL), TaiKhoanController.getByMa);


// --- [ĐÃ BỔ SUNG] Route tạo tài khoản riêng lẻ (cho Modal Thêm tài khoản) ---
// Yêu cầu quyền quản lý tài khoản (hoặc quyền tạo nhân viên tương đương)
router.post("/TaiKhoans", authenticate, authorizePolicy(POLICIES.ACCOUNT_LOCK), TaiKhoanController.create);

// Khóa tài khoản/Reset mật khẩu (Admin)
router.put("/TaiKhoans/:MaTK", authenticate, authorizePolicy(POLICIES.ACCOUNT_LOCK), TaiKhoanController.update);

// Xóa tài khoản (Thường ít dùng, chỉ Admin)
router.delete("/TaiKhoans/:MaTK", authenticate, authorizePolicy(POLICIES.ACCOUNT_LOCK), TaiKhoanController.delete);


// ==========================================
// 4. DANH MỤC (Category - Public View, Admin Manage)
// ==========================================
// Xem (Ai cũng xem được, kể cả chưa login - Tùy nghiệp vụ, ở đây để Public cho khách xem hàng)
router.get("/DanhMucs", DanhMucController.getAll);
router.get("/DanhMucs/PhanTrang", DanhMucController.getPaginated);
router.get("/DanhMucs/Search", DanhMucController.search);
router.get("/DanhMucs/ChiTiet/:MaDM", DanhMucController.getDetailCustom);

// Thống kê & Xuất Excel (Chỉ nội bộ Admin/NV)
router.get("/DanhMucs/ThongKe/TongQuan", authenticate, authorizePolicy(POLICIES.INVENTORY_STATS), DanhMucController.getStats);
router.get("/DanhMucs/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), DanhMucController.exportToExcel);

router.get("/DanhMucs/:MaDM", DanhMucController.getByMa);

// Quản lý (Thêm/Sửa/Xóa - Chỉ Admin/Thủ kho)
router.post("/DanhMucs", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), DanhMucController.create);
router.put("/DanhMucs/:MaDM", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), DanhMucController.update);
router.delete("/DanhMucs/:MaDM", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), DanhMucController.delete);


// ==========================================
// 5. NHÀ CUNG CẤP (Supplier - Internal Use)
// ==========================================
// Chỉ nhân viên/Admin mới cần xem NCC, Khách không cần
router.get("/NhaCungCaps", authenticate, authorizePolicy(POLICIES.SUPPLIER_MANAGE), NhaCungCapController.getAll);
router.get("/NhaCungCaps/PhanTrang", authenticate, authorizePolicy(POLICIES.SUPPLIER_MANAGE), NhaCungCapController.getPaginated);
router.get("/NhaCungCaps/BaoCao/SanPham", authenticate, authorizePolicy(POLICIES.SUPPLIER_MANAGE), NhaCungCapController.getSupplierReport);
router.get("/NhaCungCaps/ThongKe/TongQuan", authenticate, authorizePolicy(POLICIES.SUPPLIER_MANAGE), NhaCungCapController.getGeneralStats);
router.get("/NhaCungCaps/Search", authenticate, authorizePolicy(POLICIES.SUPPLIER_MANAGE), NhaCungCapController.search);
router.get("/NhaCungCaps/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), NhaCungCapController.exportToExcel);
router.get("/NhaCungCaps/:MaNCC", authenticate, authorizePolicy(POLICIES.SUPPLIER_MANAGE), NhaCungCapController.getByMa);

// Thêm/Sửa/Xóa (Admin/Thủ kho)
router.post("/NhaCungCaps", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), NhaCungCapController.create);
router.put("/NhaCungCaps/:MaNCC", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), NhaCungCapController.update);
router.delete("/NhaCungCaps/:MaNCC", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), NhaCungCapController.delete);


// ==========================================
// 6. KHÁCH HÀNG (Customer - CRM)
// ==========================================
// Xem danh sách (Admin/NV bán hàng)
router.get("/KhachHangs", authenticate, authorizePolicy(POLICIES.CUSTOMER_VIEW_ALL), KhachHangController.getAll);
router.get("/KhachHangs/PhanTrang", authenticate, authorizePolicy(POLICIES.CUSTOMER_VIEW_ALL), KhachHangController.getPaginated);
router.get("/KhachHangs/Search", authenticate, authorizePolicy(POLICIES.CUSTOMER_VIEW_ALL), KhachHangController.search);

// Thống kê VIP (Chỉ Admin/NV)
router.get("/KhachHangs/VipStats", authenticate, authorizePolicy(POLICIES.CUSTOMER_TOP_SPENDERS), KhachHangController.getVipStats); 

// Xuất Excel & Lịch sử mua (Admin/NV)
router.get("/KhachHangs/:MaKH/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), KhachHangController.exportCustomerInvoices);
router.get("/KhachHangs/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), KhachHangController.exportToExcel);

// Lịch sử mua hàng (Quan trọng: Khách xem của mình hoặc Admin xem khách)
// Controller cần xử lý logic: Nếu là Khách -> Chỉ lấy đơn của chính họ
router.get("/KhachHangs/:MaKH/DonHang", authenticate, authorizePolicy(POLICIES.CUSTOMER_VIEW_DETAIL), KhachHangController.getOrders);

router.get("/KhachHangs/:MaKH", authenticate, authorizePolicy(POLICIES.CUSTOMER_VIEW_DETAIL), KhachHangController.getByMa);

// Tạo mới (NV tạo tại quầy)
router.post("/KhachHangs", authenticate, authorizePolicy(POLICIES.CUSTOMER_CREATE), KhachHangController.create);

// Sửa (Admin/NV sửa thông tin khách)
router.put("/KhachHangs/:MaKH", authenticate, authorizePolicy(POLICIES.CUSTOMER_UPDATE), KhachHangController.update);

// Xóa (Chỉ Admin)
router.delete("/KhachHangs/:MaKH", authenticate, authorizePolicy(POLICIES.CUSTOMER_DELETE), KhachHangController.delete);


// ==========================================
// 7. SẢN PHẨM (Product - Public View)
// ==========================================
// Xem (Public)
router.get("/SanPhams", SanPhamController.getAll);
router.get("/SanPhams/PhanTrang", SanPhamController.getPaginated);
router.get("/SanPhams/SearchAdvanced", SanPhamController.searchAdvanced);
router.get("/SanPhams/:MaSP", SanPhamController.getByMa);

// Thống kê tồn kho (Chỉ nội bộ: Admin/NV/Thủ kho)
router.get("/SanPhams/ThongKe/TonKho", authenticate, authorizePolicy(POLICIES.INVENTORY_STATS), SanPhamController.getInventoryStats);
router.get("/SanPhams/ThongKe/DanhMuc", authenticate, authorizePolicy(POLICIES.INVENTORY_STATS), SanPhamController.getCategoryStats);
router.get("/SanPhams/ThongKe/TongQuan", authenticate, authorizePolicy(POLICIES.INVENTORY_STATS), SanPhamController.getGeneralStats);

// Xuất Excel
router.get("/SanPhams/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), SanPhamController.exportToExcel);

// Quản lý (Admin/Thủ kho)
router.post("/SanPhams", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), SanPhamController.create);
router.put("/SanPhams/:MaSP", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), SanPhamController.update);
router.delete("/SanPhams/:MaSP", authenticate, authorizePolicy(POLICIES.PRODUCT_MANAGE), SanPhamController.delete);


// ==========================================
// 8. HÓA ĐƠN (Order - Sales)
// ==========================================
// Xem danh sách (Admin/NV xem hết, Khách xem của mình - Controller tự filter)
router.get("/HoaDons", authenticate, authorizePolicy(POLICIES.ORDER_VIEW_ALL), HoaDonController.getAll);
router.get("/HoaDons/PhanTrang", authenticate, authorizePolicy(POLICIES.ORDER_VIEW_ALL), HoaDonController.getPaginated);

// Thống kê doanh thu (Chỉ Admin)
router.get("/HoaDons/ThongKe", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), HoaDonController.getStats);
router.get("/HoaDons/ThongKe/SoLuong", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), HoaDonController.getOrderCounts);
router.get("/HoaDons/LocTheoNgay", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), HoaDonController.getByDate);
router.get("/HoaDons/TopBanChay", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), HoaDonController.getTopSelling);
router.get("/HoaDons/Export/Excel", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), HoaDonController.exportExcel);
// Chi tiết đơn
router.get("/HoaDons/:MaHD", authenticate, authorizePolicy(POLICIES.ORDER_VIEW_ALL), HoaDonController.getByMa);

// Tạo đơn (Khách mua, NV tạo)
router.post("/HoaDons", authenticate, authorizePolicy(POLICIES.ORDER_CREATE), HoaDonController.create);

// Cập nhật trạng thái (Admin/NV duyệt đơn, giao hàng)
router.put("/HoaDons/:MaHD", authenticate, authorizePolicy(POLICIES.ORDER_UPDATE), HoaDonController.update);

// Xóa đơn (Chỉ Admin - Rất hạn chế dùng)
router.delete("/HoaDons/:MaHD", authenticate, authorizePolicy(POLICIES.ORDER_DELETE), HoaDonController.delete);


// ==========================================
// 9. CHI TIẾT HÓA ĐƠN (OrderDetail)
// ==========================================
// Đi theo quyền của Hóa Đơn
router.get("/ChiTietHoaDons/:ID", authenticate, authorizePolicy(POLICIES.ORDER_VIEW_ALL), ChiTietHoaDonController.getById);
router.get("/ChiTietHoaDons/HoaDon/:MaHD", authenticate, authorizePolicy(POLICIES.ORDER_VIEW_ALL), ChiTietHoaDonController.getByHoaDon);

// Tạo/Sửa/Xóa chi tiết (Chỉ khi đơn chưa hoàn thành - Logic trong Service)
router.post("/ChiTietHoaDons", authenticate, authorizePolicy(POLICIES.ORDER_UPDATE), ChiTietHoaDonController.create);
router.put("/ChiTietHoaDons/:ID", authenticate, authorizePolicy(POLICIES.ORDER_UPDATE), ChiTietHoaDonController.update); 
router.delete("/ChiTietHoaDons/:ID", authenticate, authorizePolicy(POLICIES.ORDER_UPDATE), ChiTietHoaDonController.delete); 


// ==========================================
// 10. DASHBOARD (Tổng quan - Chỉ Admin)
// ==========================================
router.get("/Dashboard/TongQuanData", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), DashboardController.getOverviewDaTa);
router.get("/Dashboard/TongQuan", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), DashboardController.getOverview);
router.get("/Dashboard/Vebieudo", authenticate, authorizePolicy(POLICIES.STATS_REVENUE), DashboardController.Vebieudo);
router.get("/Dashboard/Export", authenticate, authorizePolicy(POLICIES.DATA_EXPORT), DashboardController.exportToExcel);


// ==========================================
// 11. GIỎ HÀNG (Shopping Cart - Personal)
// ==========================================
// Yêu cầu: Phải đăng nhập (authenticate). Không cần Policy đặc biệt.

// Lấy danh sách giỏ hàng
router.get("/Cart", authenticate, CartController.get);

// Thêm vào giỏ (Có validate dữ liệu đầu vào)
router.post("/Cart/Add", authenticate, validate(addToCartSchema), CartController.add);

// Cập nhật số lượng
router.put("/Cart/Update", authenticate, validate(updateCartSchema), CartController.update);

// Xóa 1 sản phẩm khỏi giỏ
router.delete("/Cart/Remove/:id", authenticate, CartController.remove);

// Xóa sạch giỏ hàng
router.delete("/Cart/Clear", authenticate, CartController.clear);

export default router;