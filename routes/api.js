import { Router } from "express";

// import { SanPhamController } from "../controllers/sanpham.controller.js"; 
// import { DanhMucController } from "../controllers/danhmuc.controller.js"; 
const router = Router();





import { NhanVienController } from "../controllers/nhanvien.controller.js";
import { TaiKhoanController } from "../controllers/taikhoan.controller.js";
import { DanhMucController } from "../controllers/danhmuc.controller.js";
import { NhaCungCapController } from "../controllers/ncc.controller.js";
import { KhachHangController } from "../controllers/khachhang.controller.js";
import { SanPhamController } from "../controllers/sanpham.controller.js";
import { HoaDonController } from "../controllers/hoadon.controller.js";
import { ChiTietHoaDonController } from "../controllers/chitiethd.controller.js";

// ==========================================
// 1. Routes NHÂN VIÊN (NhanVien)
// ==========================================

router.get("/NhanViens", NhanVienController.getAll);
router.get("/NhanViens/PhanTrang", NhanVienController.getPaginated);
router.get("/NhanViens/Search", NhanVienController.search);//http://localhost:3000/api/NhanViens/Search/?hoTen=Nguyen&diaChi=HCM // có thể tìm kiếm theo hoTen, tuNgaySinh,gioiTinh, diaChi, chucVu
// URL: http://localhost:3000/api/NhanViens/BaoCao/HieuSuat?startDate=2024-01-01&endDate=2024-12-31
router.get("/NhanViens/BaoCao/HieuSuat", NhanVienController.getPerformanceReport);
router.get("/NhanViens/Export/Excel", NhanVienController.exportToExcel);//xuất excel toàn bộ nhân viên
router.get("/NhanViens/:MaNV", NhanVienController.getByMa); // Ma là MaNV (VD: NV001)
router.post("/NhanViens", NhanVienController.create);
router.put("/NhanViens/:MaNV", NhanVienController.update);
router.delete("/NhanViens/:MaNV", NhanVienController.delete);




// ==========================================
// 2. Routes TÀI KHOẢN (TaiKhoan)
// ==========================================
router.get("/TaiKhoans", TaiKhoanController.getAll);
router.get("/TaiKhoans/PhanTrang", TaiKhoanController.getPaginated);//http://localhost:3000/api/TaiKhoans/PhanTrang?page=2
router.get("/TaiKhoans/:MaTK", TaiKhoanController.getByMa); // Ma là MaTK
router.post("/TaiKhoans", TaiKhoanController.create);
router.put("/TaiKhoans/:MaTK", TaiKhoanController.update);
router.delete("/TaiKhoans/:MaTK", TaiKhoanController.delete);
router.post("/TaiKhoans/Login", TaiKhoanController.postLogin);





// ==========================================
// 3. Routes DANH MỤC (DanhMuc)
// ==========================================
router.get("/DanhMucs", DanhMucController.getAll);
router.get("/DanhMucs/PhanTrang", DanhMucController.getPaginated);
router.get("/DanhMucs/Search", DanhMucController.search); // VD: /DanhMucs/Search?ten=iphone
router.get("/DanhMucs/:MaDM", DanhMucController.getByMa); // Ma là MaDM
router.post("/DanhMucs", DanhMucController.create);
router.put("/DanhMucs/:MaDM", DanhMucController.update);
router.delete("/DanhMucs/:MaDM", DanhMucController.delete);





// ==========================================
// 4. Routes NHÀ CUNG CẤP (NhaCungCap)
// ==========================================
router.get("/NhaCungCaps", NhaCungCapController.getAll);
router.get("/NhaCungCaps/PhanTrang", NhaCungCapController.getPaginated);
// URL: http://localhost:3000/api/NhaCungCaps/BaoCao/SanPham?MaNCC=NCC01
router.get("/NhaCungCaps/BaoCao/SanPham", NhaCungCapController.getSupplierReport);
router.get("/NhaCungCaps/Search", NhaCungCapController.search);
router.get("/NhaCungCaps/Export/Excel", NhaCungCapController.exportToExcel); // xuất excel toàn bộ nhà cung cấp
router.get("/NhaCungCaps/:MaNCC", NhaCungCapController.getByMa); // Ma là MaNCC
router.post("/NhaCungCaps", NhaCungCapController.create);
router.put("/NhaCungCaps/:MaNCC", NhaCungCapController.update);
router.delete("/NhaCungCaps/:MaNCC", NhaCungCapController.delete);







// ==========================================
// 5. Routes KHÁCH HÀNG (KhachHang)
// ==========================================
router.get("/KhachHangs", KhachHangController.getAll);
router.get("/KhachHangs/PhanTrang", KhachHangController.getPaginated);
router.get("/KhachHangs/Search", KhachHangController.search);
// Lấy danh sách VIP (Đặt trên route :MaKH)
router.get("/KhachHangs/VipStats", KhachHangController.getVipStats); 
// --- Xuất Excel chi tiết hóa đơn của 1 khách ---
// URL: http://localhost:3000/api/KhachHangs/KH001/Export/Excel
router.get("/KhachHangs/:MaKH/Export/Excel", KhachHangController.exportCustomerInvoices);
// Lấy lịch sử mua của 1 người
router.get("/KhachHangs/:MaKH/DonHang", KhachHangController.getOrders);
router.get("/KhachHangs/Export/Excel", KhachHangController.exportToExcel); // xuất excel toàn bộ khách hàng
router.get("/KhachHangs/:MaKH", KhachHangController.getByMa); // Ma là MaKH
router.post("/KhachHangs", KhachHangController.create);
router.put("/KhachHangs/:MaKH", KhachHangController.update);
router.delete("/KhachHangs/:MaKH", KhachHangController.delete);






// ==========================================
// 6. Routes SẢN PHẨM (SanPham)
// ==========================================
router.get("/SanPhams", SanPhamController.getAll);
// 1. Route phân trang và sắp xếp danh sách (VD: /SanPhams/PhanTrang?page=1&sortBy=GiaBan&order=DESC)
router.get("/SanPhams/PhanTrang", SanPhamController.getPaginated);
router.get("/SanPhams/SearchAdvanced", SanPhamController.searchAdvanced);

// ---  Xuất Excel ---
// URL: http://localhost:3000/api/SanPhams/Export/Excel
router.get("/SanPhams/Export/Excel", SanPhamController.exportToExcel);
// ---  Thống kê tồn kho ---
// URL: http://localhost:3000/api/SanPhams/ThongKe/TonKho?threshold=5
router.get("/SanPhams/ThongKe/TonKho", SanPhamController.getInventoryStats);
router.get("/SanPhams/:MaSP", SanPhamController.getByMa); // Ma là MaSP

router.post("/SanPhams", SanPhamController.create);
router.put("/SanPhams/:MaSP", SanPhamController.update);
router.delete("/SanPhams/:MaSP", SanPhamController.delete);

// ==========================================
// 7. Routes HÓA ĐƠN (HoaDon)
// ==========================================
router.get("/HoaDons", HoaDonController.getAll);
router.get("/HoaDons/PhanTrang", HoaDonController.getPaginated); //
router.get("/HoaDons/ThongKe", HoaDonController.getStats); // Thống kê doanh thu theo cả năm hoặc theo tháng+năm http://localhost:3000/api/HoaDons/ThongKe?year=2024&month=4
router.get("/HoaDons/LocTheoNgay", HoaDonController.getByDate);//?startDate=...&endDate=...


router.get("/HoaDons/TopBanChay", HoaDonController.getTopSelling);// URL mẫu: http://localhost:3000/api/HoaDons/TopBanChay?month=4&year=2024
router.get("/HoaDons/:MaHD", HoaDonController.getByMa); // Ma là MaHD
router.post("/HoaDons", HoaDonController.create);
router.put("/HoaDons/:MaHD", HoaDonController.update);
router.delete("/HoaDons/:MaHD", HoaDonController.delete);

// ==========================================
// 8. Routes CHI TIẾT HÓA ĐƠN (ChiTietHoaDon)
// ==========================================
// Lấy 1 dòng chi tiết cụ thể theo ID (số tự tăng)
router.get("/ChiTietHoaDons/:ID", ChiTietHoaDonController.getById);

// Lấy danh sách sản phẩm của 1 hóa đơn cụ thể (VD: Lấy list hàng của HD001)
router.get("/ChiTietHoaDons/HoaDon/:MaHD", ChiTietHoaDonController.getByHoaDon);

router.post("/ChiTietHoaDons", ChiTietHoaDonController.create);
router.put("/ChiTietHoaDons/:ID", ChiTietHoaDonController.update); 
router.delete("/ChiTietHoaDons/:ID", ChiTietHoaDonController.delete); 
export default router;
