import express from "express";

const router = express.Router();
//dã xong liên kết với api
router.get("/sanpham", (req, res) => {
  res.render('sanpham');
});


router.get("/trangchu", (req, res) => {
  res.render('trangchu');
});

router.get("/dangki", (req, res) => {
  res.render('dangki');
});

router.get("/dangnhap", (req, res) => {
  res.render('dangnhap');
});

router.get("/giohang", (req, res) => {
  res.render('giohang');
});
  router.get("/chitietsp", (req, res) => {
  res.render('chitietsp');
});

router.get("/thanhtoan", (req, res) => {
  res.render('thanhtoan');
});

//dã xong liên kết với api
router.get("/QLSanPham", (req, res) => {
  res.render('ql_sanpham');
});
//dã xong liên kết với api
router.get("/TongQuanHeThong", (req, res) => {
  res.render('TongQuanHT');
});


router.get("/QLKhachHang", (req, res) => {
  res.render('QLKhachHang');
});

router.get("/QLNhanVien", (req, res) => {
  res.render('QLNhanVien');
});

router.get("/QLDonHang", (req, res) => {
  res.render('QLDonHang');
});

router.get("/QLDangMuc", (req, res) => {
  res.render('QLDangMuc');
});

router.get("/QLNhaCungCap", (req, res) => {
  res.render('QLNhaCungCap');
});


export default router;
