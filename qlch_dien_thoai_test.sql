DROP DATABASE IF EXISTS qlch_dien_thoai;
CREATE DATABASE qlch_dien_thoai;
USE qlch_dien_thoai;

-- ==========================================================
-- 1. TẠO BẢNG (STRUCTURE)
-- ==========================================================

-- 1. Bảng Nhân Viên
CREATE TABLE NhanVien (
    MaNV VARCHAR(20) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    NgaySinh DATE,
    GioiTinh ENUM('Nam', 'Nu', 'Khac'),
    SoDienThoai VARCHAR(20) NOT NULL UNIQUE,
    Email VARCHAR(100),
    DiaChi VARCHAR(255),
    ChucVu VARCHAR(50), -- VD: QuanLy, BanHang, Kho
    LuongCoBan DECIMAL(15, 0),
    NgayVaoLam DATE DEFAULT (CURRENT_DATE)
);

-- 2. Bảng Khách Hàng (Đã gộp NgaySinh, GioiTinh vào đây)
CREATE TABLE KhachHang (
    MaKH VARCHAR(20) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL UNIQUE,
    DiaChi VARCHAR(255),
    Email VARCHAR(100),
    NgaySinh DATE,
    GioiTinh ENUM('Nam', 'Nu', 'Khac')
);

-- 3. Bảng Tài khoản (Đã điều chỉnh logic MaNV/MaKH nullable)
CREATE TABLE TaiKhoan (
    MaTK VARCHAR(20) PRIMARY KEY,
    
    -- Hai cột tham chiếu riêng biệt, cho phép NULL
    MaNV VARCHAR(20) NULL, 
    MaKH VARCHAR(20) NULL, 
    
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL, -- Lưu ý: Dữ liệu mẫu đang để plain text, thực tế cần Hash
    QuyenHan ENUM('QuanLy', 'NhanVien', 'KhachHang') DEFAULT 'KhachHang',
    TrangThai BIT DEFAULT 1, -- 1: Hoạt động, 0: Khóa
    NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE,
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE CASCADE,
    
    -- Đảm bảo một tài khoản phải thuộc về hoặc NV hoặc KH (Logic mềm, DB check FK)
    CONSTRAINT CK_TaiKhoan_Owner CHECK (MaNV IS NOT NULL OR MaKH IS NOT NULL)
);

-- 4. Bảng Danh Mục
CREATE TABLE DanhMuc (
    MaDM VARCHAR(20) PRIMARY KEY,
    TenDanhMuc VARCHAR(100) NOT NULL,
    MoTa TEXT
);

-- 5. Bảng Nhà Cung Cấp
CREATE TABLE NhaCungCap (
    MaNCC VARCHAR(20) PRIMARY KEY,
    TenNhaCungCap VARCHAR(100) NOT NULL,
    NguoiLienHe VARCHAR(50),
    SoDienThoai VARCHAR(20),
    DiaChi VARCHAR(255)
);

-- 6. Bảng Sản Phẩm
CREATE TABLE SanPham (
    MaSP VARCHAR(20) PRIMARY KEY,
    TenSanPham VARCHAR(255) NOT NULL,
    MaDM VARCHAR(20), 
    MaNCC VARCHAR(20), 
    GiaBan DECIMAL(15, 0) NOT NULL,
    SoLuongTon INT DEFAULT 0,
    NgayNhap DATETIME DEFAULT CURRENT_TIMESTAMP,
    MoTa TEXT,
    HinhAnh VARCHAR(255),
    
    FOREIGN KEY (MaDM) REFERENCES DanhMuc(MaDM) ON DELETE SET NULL,
    FOREIGN KEY (MaNCC) REFERENCES NhaCungCap(MaNCC) ON DELETE SET NULL
);

-- 7. Bảng Hóa Đơn (Đã thêm PhuongThucThanhToan)
CREATE TABLE HoaDon (
    MaHD VARCHAR(20) PRIMARY KEY,
    MaKH VARCHAR(20), 
    MaNV VARCHAR(20), 
    NgayLap DATETIME DEFAULT CURRENT_TIMESTAMP,
    TongTien DECIMAL(15, 0) DEFAULT 0,
    TrangThai ENUM('ChoXuLy', 'HoanThanh', 'DaHuy') DEFAULT 'ChoXuLy',
    PhuongThucThanhToan ENUM('TienMat', 'ChuyenKhoan', 'The') DEFAULT 'TienMat',
    GhiChu TEXT,
    
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH) ON DELETE SET NULL,
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE SET NULL
);

-- 8. Bảng Chi Tiết Hóa Đơn
CREATE TABLE ChiTietHoaDon (
    ID INT PRIMARY KEY AUTO_INCREMENT, -- Đổi thành AUTO_INCREMENT để đỡ phải điền tay ID
    MaHD VARCHAR(20) NOT NULL, 
    MaSP VARCHAR(20) NOT NULL, 
    SoLuong INT NOT NULL CHECK (SoLuong > 0),
    DonGia DECIMAL(15, 0) NOT NULL,
    ThanhTien DECIMAL(15, 0) GENERATED ALWAYS AS (SoLuong * DonGia) STORED,
    
    FOREIGN KEY (MaHD) REFERENCES HoaDon(MaHD) ON DELETE CASCADE,
    FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP)
);

-- ==========================================================
-- 2. INSERT DỮ LIỆU (DATA)
-- ==========================================================

-- 1. Insert NhanVien
INSERT INTO NhanVien (MaNV, HoTen, NgaySinh, GioiTinh, SoDienThoai, Email, DiaChi, ChucVu, LuongCoBan, NgayVaoLam) VALUES
('NV001', 'Nguyen Van An', '1990-01-01', 'Nam', '0901000001', 'an.nguyen@gmail.com', '123 Le Loi, HCM', 'QuanLy', 20000000, '2020-01-01'),
('NV002', 'Tran Thi Binh', '1995-02-02', 'Nu', '0901000002', 'binh.tran@gmail.com', '456 Nguyen Hue, HCM', 'BanHang', 8000000, '2021-02-15'),
('NV003', 'Le Van Cuong', '1992-03-03', 'Nam', '0901000003', 'cuong.le@gmail.com', '789 Tran Hung Dao, HCM', 'KyThuat', 10000000, '2021-03-10'),
('NV004', 'Pham Thi Dung', '1998-04-04', 'Nu', '0901000004', 'dung.pham@gmail.com', '321 Ba Thang Hai, HCM', 'BanHang', 8000000, '2022-04-20'),
('NV005', 'Hoang Van Em', '1993-05-05', 'Nam', '0901000005', 'em.hoang@gmail.com', '654 Cach Mang Thang 8, HCM', 'Kho', 9000000, '2022-05-05'),
('NV006', 'Do Thi Phuong', '1997-06-06', 'Nu', '0901000006', 'phuong.do@gmail.com', '987 Vo Van Kiet, HCM', 'KeToan', 12000000, '2020-06-06'),
('NV007', 'Ngo Van Giau', '1991-07-07', 'Nam', '0901000007', 'giau.ngo@gmail.com', '147 Hai Ba Trung, HN', 'QuanLy', 18000000, '2019-07-07'),
('NV008', 'Vu Thi Hoa', '1996-08-08', 'Nu', '0901000008', 'hoa.vu@gmail.com', '258 Kim Ma, HN', 'BanHang', 8500000, '2021-08-08'),
('NV009', 'Dang Van Hung', '1994-09-09', 'Nam', '0901000009', 'hung.dang@gmail.com', '369 Cau Giay, HN', 'KyThuat', 11000000, '2021-09-09'),
('NV010', 'Bui Thi Kieu', '1999-10-10', 'Nu', '0901000010', 'kieu.bui@gmail.com', '159 Lang Ha, HN', 'BanHang', 8000000, '2023-01-01'),
('NV011', 'Ly Van Long', '1989-11-11', 'Nam', '0901000011', 'long.ly@gmail.com', '753 Nguyen Trai, HN', 'Kho', 9500000, '2020-11-11'),
('NV012', 'Trinh Thi Mai', '1995-12-12', 'Nu', '0901000012', 'mai.trinh@gmail.com', '951 Tay Son, HN', 'BanHang', 8200000, '2022-12-12'),
('NV013', 'Mai Van Nam', '1993-01-13', 'Nam', '0901000013', 'nam.mai@gmail.com', '357 Le Duan, Da Nang', 'KyThuat', 10500000, '2021-01-13'),
('NV014', 'Cao Thi Oanh', '1998-02-14', 'Nu', '0901000014', 'oanh.cao@gmail.com', '852 Nguyen Van Linh, Da Nang', 'BanHang', 8000000, '2023-02-14'),
('NV015', 'Duong Van Phuc', '1992-03-15', 'Nam', '0901000015', 'phuc.duong@gmail.com', '123 Hung Vuong, Da Nang', 'BaoVe', 7000000, '2023-03-15');

-- 2. Insert KhachHang (Đã gộp thông tin NgaySinh, GioiTinh từ yêu cầu Update cũ)
INSERT INTO KhachHang (MaKH, HoTen, SoDienThoai, DiaChi, Email, NgaySinh, GioiTinh) VALUES
('KH001', 'Nguyen Van Khach', '0990000001', 'Go Vap, HCM', 'khach1@gmail.com', '1990-01-15', 'Nam'),
('KH002', 'Tran Thi Mua', '0990000002', 'Tan Binh, HCM', 'mua2@gmail.com', '1992-03-20', 'Nu'),
('KH003', 'Le Van Sam', '0990000003', 'Quan 3, HCM', 'sam3@gmail.com', '1988-07-10', 'Nam'),
('KH004', 'Pham Thi Tieu', '0990000004', 'Quan 1, HCM', 'tieu4@gmail.com', '1995-11-05', 'Nu'),
('KH005', 'Hoang Van Dung', '0990000005', 'Binh Thanh, HCM', 'dung5@gmail.com', '1991-09-18', 'Nam'),
('KH006', 'Do Thi Xai', '0990000006', 'Thu Duc, HCM', 'xai6@gmail.com', '1994-02-25', 'Nu'),
('KH007', 'Ngo Van Tra', '0990000007', 'Dong Da, HN', 'tra7@gmail.com', '1989-06-30', 'Nam'),
('KH008', 'Vu Thi Gop', '0990000008', 'Hoan Kiem, HN', 'gop8@gmail.com', '1996-08-12', 'Nu'),
('KH009', 'Dang Van Bill', '0990000009', 'Cau Giay, HN', 'bill9@gmail.com', '1993-04-22', 'Nam'),
('KH010', 'Bui Thi Don', '0990000010', 'Thanh Xuan, HN', 'don10@gmail.com', '1997-12-01', 'Nu'),
('KH011', 'Ly Van Hoa', '0990000011', 'Hai Chau, Da Nang', 'hoa11@gmail.com', '1987-05-17', 'Nam'),
('KH012', 'Trinh Thi Phuong', '0990000012', 'Son Tra, Da Nang', 'phuong12@gmail.com', '1995-10-08', 'Nu'),
('KH013', 'Mai Van Huy', '0990000013', 'Ninh Kieu, Can Tho', 'huy13@gmail.com', '1992-01-19', 'Nam'),
('KH014', 'Cao Thi Lan', '0990000014', 'Bien Hoa, Dong Nai', 'lan14@gmail.com', '1998-03-27', 'Nu'),
('KH015', 'Duong Van Dat', '0990000015', 'Thu Dau Mot, Binh Duong', 'dat15@gmail.com', '1990-07-14', 'Nam');

-- 3. Insert TaiKhoan (Sử dụng cấu trúc mới: MaNV có giá trị, MaKH là NULL)
INSERT INTO TaiKhoan (MaTK, MaNV, MaKH, TenDangNhap, MatKhau, QuyenHan, TrangThai, NgayTao) VALUES
('TK001', 'NV001', NULL, 'admin', 'admin123', 'QuanLy', 1, NOW()),
('TK002', 'NV002', NULL, 'binhtran', 'binhtran123', 'NhanVien', 1, NOW()),
('TK003', 'NV003', NULL, 'cuongle', 'cuongle123', 'NhanVien', 1, NOW()),
('TK004', 'NV004', NULL, 'dungpham', 'dungpham123', 'NhanVien', 1, NOW()),
('TK005', 'NV005', NULL, 'emhoang', 'emhoang123', 'NhanVien', 1, NOW()),
('TK006', 'NV006', NULL, 'phuongdo', 'phuongdo123', 'QuanLy', 1, NOW()),
('TK007', 'NV007', NULL, 'giaungo', 'giaungo123', 'QuanLy', 1, NOW()),
('TK008', 'NV008', NULL, 'hoavu', 'hoavu123', 'NhanVien', 1, NOW()),
('TK009', 'NV009', NULL, 'hungdang', 'hungdang123', 'NhanVien', 1, NOW()),
('TK010', 'NV010', NULL, 'kieubui', 'kieubui123', 'NhanVien', 1, NOW()),
('TK011', 'NV011', NULL, 'longly', 'longly123', 'NhanVien', 1, NOW()),
('TK012', 'NV012', NULL, 'maitrinh', 'maitrinh123', 'NhanVien', 0, NOW()),
('TK013', 'NV013', NULL, 'nammai', 'nammai123', 'NhanVien', 1, NOW()),
('TK014', 'NV014', NULL, 'oanhcao', 'oanhcao123', 'NhanVien', 1, NOW()),
('TK015', 'NV015', NULL, 'phucduong', 'phucduong123', 'NhanVien', 1, NOW());

-- Có thể insert thử 1 tài khoản cho Khách hàng để test
-- INSERT INTO TaiKhoan (MaTK, MaNV, MaKH, TenDangNhap, MatKhau, QuyenHan, TrangThai) 
-- VALUES ('TK016', NULL, 'KH001', 'khach1', 'khach123', 'KhachHang', 1);

-- 4. Insert DanhMuc
INSERT INTO DanhMuc (MaDM, TenDanhMuc, MoTa) VALUES
('DM001', 'iPhone', 'Điện thoại Apple iPhone'),
('DM002', 'Samsung', 'Điện thoại Samsung Galaxy'),
('DM003', 'Xiaomi', 'Điện thoại Xiaomi, Redmi, Poco'),
('DM004', 'Oppo', 'Điện thoại Oppo'),
('DM005', 'Vivo', 'Điện thoại Vivo'),
('DM006', 'Realme', 'Điện thoại Realme'),
('DM007', 'Nokia', 'Điện thoại phổ thông và smartphone Nokia'),
('DM008', 'Sony', 'Điện thoại Sony Xperia'),
('DM009', 'Asus', 'Điện thoại Asus ROG Phone'),
('DM010', 'Google Pixel', 'Điện thoại Google'),
('DM011', 'iPad', 'Máy tính bảng Apple'),
('DM012', 'Samsung Tab', 'Máy tính bảng Samsung'),
('DM013', 'Tai nghe', 'Tai nghe Bluetooth, có dây'),
('DM014', 'Sạc cáp', 'Củ sạc, dây cáp, sạc dự phòng'),
('DM015', 'Ốp lưng', 'Ốp lưng và bao da');

-- 5. Insert NhaCungCap
INSERT INTO NhaCungCap (MaNCC, TenNhaCungCap, NguoiLienHe, SoDienThoai, DiaChi) VALUES
('NCC001', 'Apple Vietnam', 'Tim Cook', '02812345678', 'Quan 1, HCM'),
('NCC002', 'Samsung Vina', 'Lee Jae Yong', '02887654321', 'Quan 1, HCM'),
('NCC003', 'Xiaomi VN', 'Lei Jun', '02412345678', 'Cau Giay, HN'),
('NCC004', 'Oppo VN', 'Sky Li', '02811122233', 'Quan 7, HCM'),
('NCC005', 'FPT Trading', 'Nguyen Van FPT', '0909090909', 'Cau Giay, HN'),
('NCC006', 'Digiworld', 'Tran Van DGW', '0908080808', 'Quan 3, HCM'),
('NCC007', 'Viettel Store', 'Le Van Viettel', '0988888888', 'Ba Dinh, HN'),
('NCC008', 'CellphoneS Dist', 'Nguyen Van Cell', '0977777777', 'Thai Ha, HN'),
('NCC009', 'Hoang Ha Mobile', 'Pham Van Hoang', '0966666666', 'Thanh Xuan, HN'),
('NCC010', 'The Gioi Di Dong', 'Nguyen Duc Tai', '0955555555', 'Thu Duc, HCM'),
('NCC011', 'Anker VN', 'Nguyen Van Pin', '0944444444', 'Tan Binh, HCM'),
('NCC012', 'Sony Electronics', 'Yoshida', '0933333333', 'Quan 1, HCM'),
('NCC013', 'Asus VN', 'Jonney Shih', '0922222222', 'Quan 10, HCM'),
('NCC014', 'Nokia HMD', 'Pekka', '0911111111', 'Cau Giay, HN'),
('NCC015', 'Pisen VN', 'Tran Van Pisen', '0901231231', 'Da Nang');

-- 6. Insert SanPham
INSERT INTO SanPham
(MaSP, TenSanPham, MaDM, MaNCC, GiaBan, SoLuongTon, NgayNhap, HinhAnh)
VALUES
('SP001','iPhone 11 64GB','DM001','NCC001',10990000,40,'2024-01-10','iphone_11.png'),
('SP002','Samsung Galaxy A14','DM002','NCC002',3990000,80,'2024-02-05','samsung_a14.png'),
('SP003','Xiaomi Redmi 12','DM003','NCC003',4290000,80,'2024-03-01','redmi_12.png'),
('SP004','iPhone 12 64GB','DM001','NCC001',12990000,30,'2024-03-15','iphone_12.png'),
('SP005','Oppo Reno 11F','DM004','NCC004',8990000,40,'2024-04-10','oppo_reno_11f.png'),
('SP006','Samsung Galaxy S22','DM002','NCC002',13990000,25,'2024-05-01','samsung_s22.png'),
('SP007','Vivo Y36','DM005','NCC006',5990000,45,'2024-05-20','vivo_y36.png'),
('SP008','iPhone 13 Mini','DM001','NCC001',14990000,20,'2024-06-05','iphone_13_mini.png'),
('SP009','Realme C55','DM006','NCC006',4590000,70,'2024-06-20','realme_c55.png'),
('SP010','Samsung Galaxy A24','DM002','NCC002',5990000,70,'2024-07-01','samsung_a24.png'),
('SP011','Nokia 105 4G','DM007','NCC014',650000,200,'2024-07-15','nokia_105.png'),
('SP012','iPhone 13','DM001','NCC001',15990000,30,'2024-08-01','iphone_13.png'),
('SP013','Sony Xperia 1 V','DM008','NCC012',29990000,10,'2024-08-20','sony_xperia_1v.png'),
('SP014','Samsung Galaxy S23','DM002','NCC002',16990000,20,'2024-09-01','samsung_s23.png'),
('SP015','Asus ROG Phone 8','DM009','NCC013',24990000,15,'2025-01-05','asus_rog_8.png'),
('SP016','iPhone 13 Pro','DM001','NCC001',19990000,15,'2024-09-20','iphone_13_pro.png'),
('SP017','Samsung Galaxy A54','DM002','NCC002',8490000,50,'2024-10-01','samsung_a54.png'),
('SP018','Google Pixel 8','DM010','NCC005',19990000,20,'2024-10-20','sony_xperia_1v.png'),
('SP019','iPhone 14','DM001','NCC001',17990000,20,'2024-11-05','iphone_14.png'),
('SP020','Samsung Galaxy Z Flip 5','DM002','NCC002',22990000,15,'2024-11-20','samsung_zflip5.png'),
('SP021','iPad Gen 10 WiFi','DM011','NCC001',10990000,25,'2024-12-01','ipad_gen10.png'),
('SP022','iPhone 15','DM001','NCC001',21990000,20,'2025-01-10','iphone_15.png'),
('SP023','Samsung Galaxy S23 Ultra','DM002','NCC002',25990000,15,'2025-01-15','samsung_s23_ultra.png'),
('SP024','Samsung Galaxy A15','DM002','NCC002',4990000,100,'2024-12-15','samsung_a15.png'),
('SP025','Tai nghe AirPods Pro 2','DM013','NCC001',5990000,50,'2025-02-01','airpods_pro_2.png'),
('SP026','iPhone SE 2022','DM001','NCC001',8990000,25,'2024-10-10','iphone_se.png'),
('SP027','Samsung Galaxy A34','DM002','NCC002',6990000,60,'2024-09-10','samsung_a34.png'),
('SP028','Samsung Galaxy S21','DM002','NCC002',10990000,30,'2024-08-10','samsung_s21.png'),
('SP029','Xiaomi Redmi Note 13','DM003','NCC003',6290000,70,'2025-02-10','redmi_note_13.png'),
('SP030','Sony WH-1000XM5','DM013','NCC012',8990000,30,'2025-03-01','sony_wh1000xm5.png');

-- 7. Insert HoaDon (Đã update thêm PhuongThucThanhToan)
INSERT INTO HoaDon (MaHD, MaKH, MaNV, NgayLap, TongTien, TrangThai, PhuongThucThanhToan, GhiChu) VALUES
-- Tiền mặt
('HD001', 'KH001', 'NV002', '2024-04-01 08:00:00', 34990000, 'HoanThanh', 'TienMat', 'Khách VIP'),
('HD004', 'KH004', 'NV004', '2024-04-02 14:15:00', 8490000, 'ChoXuLy', 'TienMat', 'Giao hàng tận nơi'),
('HD007', 'KH007', 'NV008', '2024-04-04 08:45:00', 8990000, 'DaHuy', 'TienMat', 'Khách đổi ý'),
('HD010', 'KH010', 'NV010', '2024-04-05 15:45:00', 1300000, 'HoanThanh', 'TienMat', 'Mua 2 máy cục gạch'),
('HD014', 'KH014', 'NV004', '2024-04-07 16:30:00', 700000, 'HoanThanh', 'TienMat', 'Mua 2 sạc'),
('HD019', 'KH004', 'NV008', '2025-09-15 16:00:00', 11990000, 'ChoXuLy', 'TienMat', NULL),
('HD025', 'KH010', 'NV008', '2025-10-12 14:40:00', 6990000, 'DaHuy', 'TienMat', 'Khách hủy đơn'),
('HD028', 'KH013', 'NV002', '2025-11-01 11:00:00', 8490000, 'ChoXuLy', 'TienMat', NULL),

-- Chuyển khoản
('HD002', 'KH002', 'NV002', '2024-04-01 09:30:00', 21990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD005', 'KH005', 'NV002', '2024-04-03 16:00:00', 22990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD008', 'KH008', 'NV010', '2024-04-04 11:00:00', 8990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD011', 'KH011', 'NV014', '2024-04-06 09:10:00', 29990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD013', 'KH013', 'NV014', '2024-04-07 14:00:00', 13990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD016', 'KH001', 'NV002', '2025-09-05 10:15:00', 15990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD018', 'KH003', 'NV010', '2025-09-12 09:45:00', 22990000, 'HoanThanh', 'ChuyenKhoan', 'Khách VIP'),
('HD021', 'KH006', 'NV014', '2025-09-25 13:10:00', 5990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD024', 'KH009', 'NV002', '2025-10-08 10:00:00', 17990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD027', 'KH012', 'NV004', '2025-10-22 16:20:00', 29990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD030', 'KH015', 'NV008', '2025-11-10 08:30:00', 15990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD033', 'KH003', 'NV014', '2025-11-22 14:00:00', 17990000, 'HoanThanh', 'ChuyenKhoan', NULL),
('HD036', 'KH006', 'NV004', '2025-12-10 10:30:00', 75000000, 'HoanThanh', 'ChuyenKhoan', 'Khách VIP mua nhiều máy'),
('HD037', 'KH007', 'NV002', '2025-12-12 14:15:00', 88000000, 'HoanThanh', 'ChuyenKhoan', 'Đơn hàng Tết'),
('HD039', 'KH009', 'NV010', '2025-12-18 16:00:00', 95000000, 'HoanThanh', 'ChuyenKhoan', 'Khách doanh nghiệp'),

-- Thẻ
('HD003', 'KH003', 'NV004', '2024-04-02 10:00:00', 31990000, 'HoanThanh', 'The', NULL),
('HD006', 'KH006', 'NV008', '2024-04-03 17:30:00', 7290000, 'HoanThanh', 'The', NULL),
('HD009', 'KH009', 'NV010', '2024-04-05 13:20:00', 11990000, 'HoanThanh', 'The', NULL),
('HD012', 'KH012', 'NV014', '2024-04-06 10:50:00', 24990000, 'ChoXuLy', 'The', NULL),
('HD015', 'KH015', 'NV002', '2024-04-08 19:00:00', 5990000, 'HoanThanh', 'The', NULL),
('HD017', 'KH002', 'NV004', '2025-09-10 14:30:00', 8490000, 'HoanThanh', 'The', NULL),
('HD020', 'KH005', 'NV002', '2025-09-20 11:20:00', 8990000, 'HoanThanh', 'The', NULL),
('HD022', 'KH007', 'NV004', '2025-10-01 08:50:00', 13990000, 'HoanThanh', 'The', NULL),
('HD023', 'KH008', 'NV010', '2025-10-05 15:30:00', 24990000, 'HoanThanh', 'The', 'Khách mua quà tặng'),
('HD026', 'KH011', 'NV014', '2025-10-18 09:15:00', 19990000, 'HoanThanh', 'The', NULL),
('HD029', 'KH014', 'NV010', '2025-11-05 13:50:00', 10990000, 'HoanThanh', 'The', NULL),
('HD031', 'KH001', 'NV004', '2025-11-15 17:10:00', 22990000, 'HoanThanh', 'The', 'Khách VIP'),
('HD032', 'KH002', 'NV002', '2025-11-18 10:45:00', 5990000, 'HoanThanh', 'The', NULL),
('HD034', 'KH004', 'NV008', '2025-12-01 09:25:00', 21990000, 'HoanThanh', 'The', NULL),
('HD035', 'KH005', 'NV010', '2025-12-05 16:40:00', 24990000, 'HoanThanh', 'The', 'Khách mua quà tặng'),
('HD038', 'KH008', 'NV008', '2025-12-15 09:45:00', 62000000, 'HoanThanh', 'The', 'Mua nhiều sản phẩm cao cấp'),
('HD040', 'KH010', 'NV014', '2025-12-20 11:30:00', 105000000, 'HoanThanh', 'The', 'Khuyến mãi cuối năm');

-- 8. Insert ChiTietHoaDon
INSERT INTO ChiTietHoaDon (MaHD, MaSP, SoLuong, DonGia) VALUES
('HD001', 'SP001', 1, 34990000),
('HD002', 'SP002', 1, 21990000),
('HD003', 'SP003', 1, 31990000),
('HD004', 'SP004', 1, 8490000),
('HD005', 'SP005', 1, 22990000),
('HD006', 'SP006', 1, 7290000),
('HD007', 'SP007', 1, 8990000),
('HD008', 'SP008', 1, 8990000),
('HD009', 'SP009', 1, 11990000),
('HD010', 'SP010', 2, 650000), 
('HD011', 'SP011', 1, 29990000),
('HD012', 'SP012', 1, 24990000),
('HD013', 'SP013', 1, 13990000),
('HD014', 'SP014', 2, 350000), 
('HD015', 'SP015', 1, 5990000),
('HD016', 'SP012', 1, 15990000),
('HD017', 'SP017', 1, 8490000),
('HD018', 'SP020', 1, 22990000),
('HD019', 'SP028', 1, 10990000),
('HD019', 'SP014', 2, 500000), 
('HD020', 'SP005', 1, 8990000),
('HD021', 'SP007', 1, 5990000),
('HD022', 'SP006', 1, 13990000),
('HD023', 'SP015', 1, 24990000),
('HD024', 'SP019', 1, 17990000),
('HD025', 'SP027', 1, 6990000),
('HD026', 'SP016', 1, 19990000),
('HD027', 'SP013', 1, 29990000),
('HD028', 'SP017', 1, 8490000),
('HD029', 'SP021', 1, 10990000),
('HD030', 'SP012', 1, 15990000),
('HD031', 'SP020', 1, 22990000),
('HD032', 'SP025', 1, 5990000),
('HD033', 'SP019', 1, 17990000),
('HD034', 'SP022', 1, 21990000),
('HD035', 'SP015', 1, 24990000),
('HD036', 'SP023', 3, 25000000),
('HD037', 'SP022', 4, 22000000),
('HD038', 'SP013', 2, 29000000),
('HD038', 'SP030', 1, 4000000),
('HD039', 'SP022', 3, 22000000),
('HD039', 'SP021', 2, 11000000),
('HD040', 'SP022', 5, 21000000);

-- Query test thử
SELECT * FROM TaiKhoan;
SELECT * FROM sanpham;
SELECT * FROM chitiethoadon;
SELECT * FROM danhmuc;
SELECT * FROM hoadon;
SELECT * FROM khachhang;
SELECT * FROM nhacungcap;
SELECT * FROM nhanvien;

UPDATE sanpham
SET TenSanPham = 'Vivo Y16',
    GiaBan = 3500000, -- Ví dụ giá mới
    HinhAnh = 'vivo-y16.png'
WHERE MaSP = 'SP007';

-- 1. Tạo hồ sơ nhân viên trước (Để làm khóa ngoại)
INSERT INTO NhanVien (MaNV, HoTen, SoDienThoai, Email, DiaChi, GioiTinh, ChucVu, LuongCoBan, NgayVaoLam)
VALUES ('NV000', 'Super Admin', '0999999999', 'admin@system.com', 'Server Room', 'Nam', 'QuanLy', 20000000, CURRENT_DATE);

-- 2. Tạo tài khoản liên kết với NV đó
-- Mật khẩu ở đây là '123456' đã được mã hóa bằng Bcrypt
INSERT INTO TaiKhoan (MaTK, MaNV, TenDangNhap, MatKhau, QuyenHan, TrangThai)
VALUES ('TK000', 'NV000', 'admin', '$2b$10$6I2MOUZsEWB9tN4SZWoUee/dmb/a9.4cbELHMIaClpgWf0Mdf0Sc.', 'QuanLy', 1);

-- ==============================================
-- Chỉnh sửa thêm
-- ==============================================
CREATE TABLE GioHang (
    MaTK VARCHAR(20),  -- Liên kết với bảng TaiKhoan
    MaSP VARCHAR(20),  -- Liên kết với bảng SanPham
    SoLuong INT DEFAULT 1,
    NgayThem DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa chính là cặp (MaTK, MaSP)
    PRIMARY KEY (MaTK, MaSP),
    
    -- Ràng buộc khóa ngoại
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE CASCADE,
    FOREIGN KEY (MaSP) REFERENCES SanPham(MaSP) ON DELETE CASCADE,
    
    -- Đảm bảo số lượng luôn dương
    CONSTRAINT CK_GioHang_SoLuong CHECK (SoLuong > 0)
);

