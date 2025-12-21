## ⛩ **NodeJS Starter**
//Bai 1 : QLSanPham
🔹 Sản Phẩm

Lấy tất cả sản phẩm:
GET http://localhost:3000/api/SanPham

Lấy theo mã sản phẩm:
GET http://localhost:3000/api/SanPham/:Ma

Thêm sản phẩm:
POST http://localhost:3000/api/SanPham

Cập nhật sản phẩm:
PUT http://localhost:3000/api/SanPham/:Ma

Xóa sản phẩm:
DELETE http://localhost:3000/api/SanPham/:Ma

Tìm kiếm sản phẩm theo tên:
GET http://localhost:3000/api/SanPham/TimkiemTen/:Ten

Thống kê sản phẩm theo danh mục:
GET http://localhost:3000/api/SanPham/THONGKE

Sắp xếp SL/ĐG + phân trang:
GET http://localhost:3000/api/SanPham/SxSL/sl/:sl/:kieusx/:trang

🔹 Danh Mục

Lấy tất cả danh mục:
GET http://localhost:3000/api/DanhMuc

Lấy danh mục theo mã:
GET http://localhost:3000/api/DanhMuc/:MaDanhMuc
Bài 2 : QLSinhVien
Nhân Viên

Lấy tất cả nhân viên:
GET http://localhost:3000/api/NhanVien

Lấy nhân viên theo mã:
GET http://localhost:3000/api/NhanVien/:MANV

Thêm nhân viên:
POST http://localhost:3000/api/NhanVien

Cập nhật nhân viên:
PUT http://localhost:3000/api/NhanVien/:MANV

Xóa nhân viên:
DELETE http://localhost:3000/api/NhanVien/:MANV

🔹 Công

Lấy tất cả công:
GET http://localhost:3000/api/Cong

Lấy theo SLNGAYCONG:
GET http://localhost:3000/api/Cong/:SLNGAYCONG

Thêm công:
POST http://localhost:3000/api/Cong

Cập nhật công:
PUT http://localhost:3000/api/Cong/:SLNGAYCONG

Xóa công:
DELETE http://localhost:3000/api/Cong/:SLNGAYCONG

🔹 Công Trình

Lấy tất cả công trình:
GET http://localhost:3000/api/CongTrinh

Lấy công trình theo MACT:
GET http://localhost:3000/api/CongTrinh/:MACT

Thêm công trình:
POST http://localhost:3000/api/CongTrinh

Cập nhật công trình:
PUT http://localhost:3000/api/CongTrinh/:MACT

Xóa công trình:
DELETE http://localhost:3000/api/CongTrinh/:MACT

🔹 Phòng Ban

Lấy tất cả phòng ban:
GET http://localhost:3000/api/PhongBan

Lấy theo MAPB:
GET http://localhost:3000/api/PhongBan/:MAPB

Thêm phòng ban:
POST http://localhost:3000/api/PhongBan

Cập nhật phòng ban:
PUT http://localhost:3000/api/PhongBan/:MAPB

Xóa phòng ban:
DELETE http://localhost:3000/api/PhongBan/:MAPB


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
