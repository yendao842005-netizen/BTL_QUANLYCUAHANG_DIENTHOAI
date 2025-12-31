## ⛩ **NodeJS Starter**
// Cấu trúc URL chạy các yêu cầu 
1. Routes NHÂN VIÊN (NhanVien)
Lấy danh sách tất cả nhân viên: http://localhost:3000/api/NhanViens

Lấy danh sách nhân viên có phân trang (Trang 1): http://localhost:3000/api/NhanViens/PhanTrang?page=1

Tìm kiếm nhân viên (Theo tên và địa chỉ): http://localhost:3000/api/NhanViens/Search?hoTen=Nguyen&diaChi=HCM

Báo cáo hiệu suất nhân viên (KPI) theo khoảng thời gian: http://localhost:3000/api/NhanViens/BaoCao/HieuSuat?startDate=2024-01-01&endDate=2024-12-31

Xuất file Excel danh sách toàn bộ nhân viên: http://localhost:3000/api/NhanViens/Export/Excel

Lấy chi tiết 1 nhân viên theo Mã (VD: NV001): http://localhost:3000/api/NhanViens/NV001

Thêm mới nhân viên (Method: POST): http://localhost:3000/api/NhanViens

Cập nhật nhân viên (Method: PUT): http://localhost:3000/api/NhanViens/NV001

Xóa nhân viên (Method: DELETE): http://localhost:3000/api/NhanViens/NV001




2. Routes TÀI KHOẢN (TaiKhoan)
Lấy danh sách tất cả tài khoản: http://localhost:3000/api/TaiKhoans

Lấy danh sách tài khoản phân trang: http://localhost:3000/api/TaiKhoans/PhanTrang?page=1

Lấy chi tiết 1 tài khoản theo Mã (VD: TK01): http://localhost:3000/api/TaiKhoans/TK01

Đăng nhập hệ thống (Method: POST): http://localhost:3000/api/TaiKhoans/Login

Tạo tài khoản mới (Method: POST): http://localhost:3000/api/TaiKhoans

Cập nhật tài khoản (Method: PUT): http://localhost:3000/api/TaiKhoans/TK01

Xóa tài khoản (Method: DELETE): http://localhost:3000/api/TaiKhoans/TK01




3. Routes DANH MỤC (DanhMuc)
Lấy tất cả danh mục sản phẩm: http://localhost:3000/api/DanhMucs

Lấy danh mục phân trang: http://localhost:3000/api/DanhMucs/PhanTrang?page=1

Tìm kiếm danh mục theo tên: http://localhost:3000/api/DanhMucs/Search?ten=iphone

Lấy chi tiết danh mục theo Mã (VD: DM01): http://localhost:3000/api/DanhMucs/DM01

Tạo danh mục mới (Method: POST): http://localhost:3000/api/DanhMucs

Cập nhật danh mục (Method: PUT): http://localhost:3000/api/DanhMucs/DM01

Xóa danh mục (Method: DELETE): http://localhost:3000/api/DanhMucs/DM01




4. Routes NHÀ CUNG CẤP (NhaCungCap)
Lấy tất cả nhà cung cấp: http://localhost:3000/api/NhaCungCaps

Lấy danh sách nhà cung cấp phân trang: http://localhost:3000/api/NhaCungCaps/PhanTrang?page=1

Báo cáo danh sách sản phẩm và tồn kho theo Nhà cung cấp: http://localhost:3000/api/NhaCungCaps/BaoCao/SanPham?MaNCC=NCC01

Tìm kiếm nhà cung cấp: http://localhost:3000/api/NhaCungCaps/Search?ten=Apple

Xuất file Excel danh sách nhà cung cấp: http://localhost:3000/api/NhaCungCaps/Export/Excel

Lấy chi tiết nhà cung cấp theo Mã (VD: NCC01): http://localhost:3000/api/NhaCungCaps/NCC01

Thêm nhà cung cấp (Method: POST): http://localhost:3000/api/NhaCungCaps

Cập nhật nhà cung cấp (Method: PUT): http://localhost:3000/api/NhaCungCaps/NCC01

Xóa nhà cung cấp (Method: DELETE): http://localhost:3000/api/NhaCungCaps/NCC01




5. Routes KHÁCH HÀNG (KhachHang)
Lấy tất cả khách hàng: http://localhost:3000/api/KhachHangs

Lấy danh sách khách hàng phân trang: http://localhost:3000/api/KhachHangs/PhanTrang?page=1

Tìm kiếm khách hàng: http://localhost:3000/api/KhachHangs/Search?hoTen=An

Thống kê và Xếp hạng khách hàng VIP (CRM): http://localhost:3000/api/KhachHangs/VipStats

Xuất Excel lịch sử mua hàng chi tiết của 1 khách hàng (VD: KH001): http://localhost:3000/api/KhachHangs/KH001/Export/Excel

Xem JSON lịch sử đơn hàng và chi tiết của 1 khách hàng (VD: KH001): http://localhost:3000/api/KhachHangs/KH001/DonHang

Xuất file Excel danh sách toàn bộ khách hàng: http://localhost:3000/api/KhachHangs/Export/Excel

Lấy chi tiết khách hàng theo Mã: http://localhost:3000/api/KhachHangs/KH001

Thêm khách hàng (Method: POST): http://localhost:3000/api/KhachHangs

Cập nhật khách hàng (Method: PUT): http://localhost:3000/api/KhachHangs/KH001

Xóa khách hàng (Method: DELETE): http://localhost:3000/api/KhachHangs/KH001





6. Routes SẢN PHẨM (SanPham)
Lấy tất cả sản phẩm: http://localhost:3000/api/SanPhams

Lấy danh sách sản phẩm phân trang và sắp xếp (Giá giảm dần): http://localhost:3000/api/SanPhams/PhanTrang?page=1&sortBy=GiaBan&order=DESC

Tìm kiếm nâng cao (Tên, khoảng giá, tồn kho): http://localhost:3000/api/SanPhams/SearchAdvanced?ten=iphone&giaMin=10000000&giaMax=30000000

Xuất file Excel danh sách sản phẩm: http://localhost:3000/api/SanPhams/Export/Excel

Thống kê cảnh báo tồn kho (Ngưỡng báo động = 5): http://localhost:3000/api/SanPhams/ThongKe/TonKho?threshold=5

Lấy chi tiết sản phẩm theo Mã (VD: SP001): http://localhost:3000/api/SanPhams/SP001

Thêm sản phẩm (Method: POST): http://localhost:3000/api/SanPhams

Cập nhật sản phẩm (Method: PUT): http://localhost:3000/api/SanPhams/SP001

Xóa sản phẩm (Method: DELETE): http://localhost:3000/api/SanPhams/SP001





7. Routes HÓA ĐƠN (HoaDon)
Lấy danh sách tất cả hóa đơn: http://localhost:3000/api/HoaDons

Lấy danh sách hóa đơn phân trang: http://localhost:3000/api/HoaDons/PhanTrang?page=1

Thống kê doanh thu theo Tháng và Năm: http://localhost:3000/api/HoaDons/ThongKe?year=2024&month=4

Lọc hóa đơn theo khoảng ngày: http://localhost:3000/api/HoaDons/LocTheoNgay?startDate=2024-01-01&endDate=2024-01-31

Thống kê Top 5 sản phẩm bán chạy nhất trong tháng: http://localhost:3000/api/HoaDons/TopBanChay?month=4&year=2024

Lấy chi tiết 1 hóa đơn theo Mã (VD: HD001): http://localhost:3000/api/HoaDons/HD001

Tạo hóa đơn mới (Method: POST): http://localhost:3000/api/HoaDons

Cập nhật hóa đơn (Method: PUT): http://localhost:3000/api/HoaDons/HD001

Xóa hóa đơn (Method: DELETE): http://localhost:3000/api/HoaDons/HD001




8. Routes CHI TIẾT HÓA ĐƠN (ChiTietHoaDon)
Lấy 1 dòng chi tiết theo ID tự tăng: http://localhost:3000/api/ChiTietHoaDons/1

Lấy danh sách sản phẩm của 1 hóa đơn cụ thể (VD: HD001): http://localhost:3000/api/ChiTietHoaDons/HoaDon/HD001

Thêm chi tiết hóa đơn (Method: POST): http://localhost:3000/api/ChiTietHoaDons

Cập nhật chi tiết hóa đơn (Method: PUT): http://localhost:3000/api/ChiTietHoaDons/1

Xóa chi tiết hóa đơn (Method: DELETE): http://localhost:3000/api/ChiTietHoaDons/1





### **`About this repository 😎`**
This repository talks about how to build an outstanding web server using latest Javascript technologies that can help micro entrepreneurs swiftly reach economic freedom.

### **`Engine Requirement 🚜`**
```
  -- Node.js v16.x or v18.x
  -- NPM v8+
```

### **`Technology Stacks 🍔`**
```
  -- Node.js
  -- Koa.js (Express.js Godfather) 🔥🔥
  -- Morgan (for logging purposes)
  -- Mongodb 💾
```

### **`Project Structures 🏢`**
```
.
│── README.md
│── .env.example  (this will be the environment file)
|── .gitignore
|── package.json
|── index.js     (entry point)
└── controllers/
|   └── ...[.js]
└── helpers/
|   └── ...[.js]
└── libraries/
|   └── ...[.js]
└── middlewares/
|   └── ...[.js]
└── repositories/
|   └── ...[.js]
└── routes/
|   └── ...[.js]
└── services/
|   └── ...[.js] (db connection or third party api)
```

### **`Install Localy 🧑🏼‍🔧`**
1. install dependency. `npm install`  
1. copy .env.example and rename it into .env (`cp .env.example .env`)
1. ajust config in .env

### **`Running App 👟`**
`npm start`  

### **`Flow Development 🏗`**
During the development cycle, a variety of supporting branches are used:  

- feature/* -- feature branches are used to develop new features for the upcoming releases. May branch off from develop and must merge into develop.
- hotfix/* -- hotfix branches are necessary to act immediately upon an undesired status of master. May branch off from master and must merge into master and develop.

Creating a new feature  

1. create new branch from master. ex: `feature/name-of-feature`.
1. write your code.
1. don't forget to run `npm run lint` to check standardize code or `npm run lintfix` to auto fix non-standard code.
1. commit & push your work to the same named branch on the server.
1. create PR into development branch for testing in dev server.
1. if its pre-production ready then create PR from the same branch into staging. **DON'T PR FROM DEVELOPMENT BRANCH!**
1. if ready to production then create PR from the same branch into master/production. **DON'T PR FROM DEVELOPMENT BRANCH OR STAGING!**

### **`Deployment 🚀`**
This flow of deployment using Git Flow with 3 main branches  

- master -- this branch contains production code. All development code is merged into master in sometime.
- staging -- this branch is a nearly exact replica of a production environment for software testing.
- development/dev -- this branch contains pre-production code. When the features are finished then they are merged into develop.
